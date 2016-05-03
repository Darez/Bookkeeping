<?php

namespace Controller\Managment;
use ItePHP\Core\Controller;
use ItePHP\Component\Form\TextField;
use ItePHP\Component\Form\FileField;
use Formatter\BootstrapFormFormatter;
use ItePHP\Exception\ValueNotFoundException;
use ItePHP\Provider\Response;
use Formatter\BasicGridFormatter;
use Manager\BasicDataManager;
use Formatter\ActionColumnFormatter;
use ItePHP\Component\Grid\Column;

class FormController extends Controller{
	

	public function index(){
		$grid=$this->createGrid();
		return compact('grid');
	}

	public function add(){
		$form=$this->createForm();

		$form->submit($this->getRequest());
		if(!$form->isValid()){
			return compact('form');
		}

		$data=$form->getData();

		$session=$this->getRequest()->getSession();
		$dir=ITE_ROOT.'/cache/'.$session->getId();
		if(file_exists($dir)){
			$this->rrmdir($dir);
		}
		mkdir($dir,0777,true);

		$data['file']->save($dir,'raw.pdf');
		$sessionData=array(
			'name'=>$data['name'],
			'fileRaw'=>$dir.'/'.'raw.pdf',
			);
		$fileView=$this->convertPdfToImage($sessionData['fileRaw'],$dir);
		$sessionData=$sessionData+compact('fileView');

		$session->set('form.add',$sessionData);

		return $this->redirect('/managment/form/add/finish');

	}

	public function addFinish(){
		$request=$this->getRequest();
		$session=$this->getRequest()->getSession();
		$sessionData=null;
		try{
			$sessionData=$session->get('form.add');
		}
		catch(ValueNotFoundException $e){
			return $this->redirect('/managment/form/add');
		}

		if($request->getType()!="POST"){
			return $sessionData;
		}

		$form=new \Entity\Form();
		$form->setName($sessionData['name']);
		
		do{
			$dir=ITE_ROOT.'/upload/'.md5(microtime()+mt_srand());
		}while(file_exists($dir));

		$form->setDir($dir);
		$this->persist($form);
		$data=$request->getData();
		$data=$data['data'];
		foreach($data as $record){ //TODO validate fields!
			$formField=new \Entity\FormField();
			$formField->setPage($record['page']);
			$formField->setPositionX($record['positionX']);
			$formField->setPositionY($record['positionY']);
			$formField->setFontSize($record['fontSize']);
			$formField->setWidth($record['width']);
			if($record['maxLength']){
				$formField->setMaxLength($record['maxLength']);				
			}
			$formField->setSpace($record['space']);
			$formField->setForm($form);
			$this->persist($formField);
		}

		$this->flush();

		if(!file_exists($dir)){
			mkdir($dir,0777,true);
		}

		//move files
		$cacheDir=ITE_ROOT.'/cache/'.$session->getId();
		rename($sessionData['fileRaw'], $dir.'/raw.pdf');
		foreach($sessionData['fileView'] as $fileView){			
			rename($cacheDir.'/'.$fileView, $dir.'/'.$fileView);
		}

		return $this->redirect('/managment/form');


	}

	public function edit($entity){
		$form=$this->createForm();
		$form->removeField('file');

		$form->setData(array(
			'name'=>$entity->getName()
			));
		$form->submit($this->getRequest());
		if(!$form->isValid()){
			return compact('form');
		}

		$data=$form->getData();

		$session=$this->getRequest()->getSession();
		$dir=ITE_ROOT.'/cache/'.$session->getId();
		if(file_exists($dir)){
			$this->rrmdir($dir);
		}
		mkdir($dir,0777,true);

		copy($entity->getDir().'/raw.pdf',$dir.'/raw.pdf');
		$sessionData=array(
			'name'=>$data['name'],
			'fileRaw'=>$dir.'/'.'raw.pdf',
			'id'=>$entity->getId(),
			);
		$fileView=$this->convertPdfToImage($sessionData['fileRaw'],$dir);
		$sessionData=$sessionData+compact('fileView');

		$session->set('form.add',$sessionData);

		return $this->redirect('/managment/form/edit/finish');

	}

	public function remove($entity){
		$formFields=$this->find('FormField',array('form'=>$entity));
		foreach($formFields as $formField){
			$this->getDoctrine()->getEntityManager()->remove($formField);
		}
		$this->getDoctrine()->getEntityManager()->remove($entity);
		$this->flush();
		return $this->redirect('/managment/form');
	}


	public function editFinish(){
		$request=$this->getRequest();
		$session=$request->getSession();
		$sessionData=null;
		try{
			$sessionData=$session->get('form.add');
		}
		catch(ValueNotFoundException $e){
			return $this->redirect('/managment/form/add');
		}

		$form=$this->cast('Mapper\Form',$sessionData['id']);

		if($request->getType()!="POST"){
			$sessionData['entity']=$form;
			return $sessionData;
		}

		$dir=$form->getDir();

		$form->setName($sessionData['name']);

		$form->setDir($dir);
		$this->persist($form);
		$data=$request->getData();
		$data=$data['data'];

		//clear
		foreach($form->getFields() as $formField){
			$this->remove($formField);
		}

		foreach($data as $record){ //TODO validate fields!
			$formField=new \Entity\FormField();
			$formField->setName($record['name']);
			$formField->setPage($record['page']);
			$formField->setPositionX($record['positionX']);
			$formField->setPositionY($record['positionY']);
			$formField->setForm($form);
			$this->persist($formField);
		}

		$this->flush();

		if(file_exists($dir)){
			$this->rrmdir($dir);
		}
		mkdir($dir,0777,true);

		rename($sessionData['fileRaw'], $dir.'/raw.pdf');//TODO move view files?

		return $this->redirect('/managment/form');


	}
	public function addFinishImage($image){
		$session=$this->getRequest()->getSession();
		$dir=ITE_ROOT.'/cache/'.$session->getId();
		$response=new Response();
		$response->setContent($dir.'/'.$image);
		return $response;
	}

	private function convertPdfToImage($file,$dest){
		$convert = 'convert  -quality 100 ' . $file . ' '.$dest.'/view-%d.jpg'; // Command creating
		exec ($convert);
		$result=array();
		$opendir=opendir($dest);
		while($readdir=readdir($opendir)){
			if(!preg_match('/^view-\d\.jpg$/', $readdir)){
				continue;
			}
			$result[]=$readdir;

		}

		closedir($opendir);
		sort($result);
		return $result;
	}

	private function createForm(){
		$build=$this->getService('form')->create();
		$build->setValidatorService($this->getService('validator'));
		$build->setFormatter(new BootstrapFormFormatter());
		$build->addField(new TextField(array(
			'name'=>'name'
			,'label'=>'Name'
			,'required'=>true
			)));
		$build->addField(new FileField(array(
			'name'=>'file'
			,'label'=>'Pattern file'
			,'required'=>true
			)));

		return $build;

	}

	private function rrmdir($src) {
	    $dir = opendir($src);
	    while(false !== ( $file = readdir($dir)) ) {
	        if (( $file != '.' ) && ( $file != '..' )) {
	            $full = $src . '/' . $file;
	            if ( is_dir($full) ) {
	                rrmdir($full);
	            }
	            else {
	                unlink($full);
	            }
	        }
	    }
	    closedir($dir);
	    rmdir($src);
	}

	private function createGrid(){
		$builder=$this->getService('grid')->create($this->getRequest());
		$builder->setFormatter(new BasicGridFormatter('managment/form'));
		$builder->setDataManager(new BasicDataManager($this->getDoctrine()->getEntityManager(),'Entity\Form'));
		$builder->setLimit(10);
		$query=$this->getRequest()->getQuery();
		if(!isset($query['page'])){
			$query['page']=1;
		}
		$builder->setPage($query['page']);

		$builder->addColumn(new Column('id','#'));
		$builder->addColumn(new Column('name','Name'));
		$builder->addColumn(new Column('id','Action',new ActionColumnFormatter('managment/form',array('edit','remove'))));

		return $builder;
	}

}