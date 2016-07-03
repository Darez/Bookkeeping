<?php

namespace Controller;
use ItePHP\Core\Controller;
use ItePHP\Component\Form\TextField;
use ItePHP\Component\Form\FileField;
use Formatter\PdfEditorFormFormatter;
use ItePHP\Exception\ValueNotFoundException;
use ItePHP\Provider\Response;
use Formatter\BasicGridFormatter;
use Manager\BasicDataManager;
use Formatter\ActionColumnFormatter;
use ItePHP\Component\Grid\Column;
use Formatter\BootstrapFormFormatter;

use phpaes\PKCS7;
use phpaes\AES_CBC_Mcrypt;
use phpaes\Util;


class FormController extends Controller{

	public function index($entity){
		$form=$this->createUploadForm($entity);
		if(!$form->isValid()){
			return compact('form');
		}
		$request=$this->getRequest();
		$postData=$request->getData();
		$buttonName=$postData['button'];
		if($buttonName=='create'){
			return $this->redirect('/form/create/'.$entity->getId());
		}

		$data=$form->getData();
		if(!$data['file']){
			$form->getField('file')->setError('Required file.');
			return compact('form');
		}
		$dir=ITE_ROOT.'/cache/'.$request->getSession()->getId();
		$data['file']->save($dir,'metadata.scbk');

		$aescbc=$this->getAESEncoder();
		$jsonData  = json_decode($aescbc->decrypt(file_get_contents($dir.'/metadata.scbk')),true);

		if(!isset($jsonData['form']) || !isset($jsonData['data'])){
			$form->getField('file')->setError('Invalid file.');
			return compact('form');
		}

		if($jsonData['form']!=$entity->getId()){
			$form->getField('file')->setError('Invalid file.');
			return compact('form');
		}

		$request->getSession()->set('values',$jsonData['data']);

		return $this->redirect('/form/create/'.$entity->getId());

	}
	
	public function create($entity){
		$values=array();
		try{
			$values=$this->getRequest()->getSession()->get('values');
		}
		catch(ValueNotFoundException $e){
			//ignore
		}

		$pages=$this->getViewFile($entity);
		$previewForm=$this->createForm();
		$validForm=$this->createForm();

		$fields=$entity->getFields();
		$fieldMap=array();
		foreach($entity->getFields() as $kField=>$field){
			$previewForm->addField(new TextField(array(
				'data-name'=>'field['.$kField.']'
				,'data-max-length'=>$field->getMaxLength()
				,'data-page'=>$field->getPage()
				,'data-font-size'=>$field->getFontSize()
				,'data-position-x'=>$field->getPositionX()
				,'data-position-y'=>$field->getPositionY()
				,'data-space'=>$field->getSpace()
				,'data-value'=>isset($values[$kField])?$values[$kField]:''
				)));

			$validForm->addField(new TextField(array(
				'name'=>'field['.$kField.']',
				'maxlength'=>$field->getMaxLength(),
				)));

			$fieldMap[$kField]=$field;
		}
		$validForm->submit($this->getRequest());
		if(!$validForm->isValid()){
			return compact('previewForm','pages');
		}

		$data=$validForm->getData();
		$pdf =$this->getService('fpdf')->create();

		//Set the source PDF file
		$pagecount = $pdf->setSourceFile($entity->getDir().'/raw.pdf');
		// $fontname = \TCPDF_FONTS::addTTFfont(__DIR__.'/../web/fonts/cousine/Cousine-Regular.ttf');
		for($i=1; $i<=$pagecount; $i++){
			$pdf->SetPrintHeader(false);
			$pdf->SetPrintFooter(false);
			$pdf->SetAutoPageBreak(TRUE, 0);
			$pdf->AddPage();
			$tpl = $pdf->importPage($i);
			$pdf->useTemplate($tpl);

			$this->preparePage($pdf,$i,$fieldMap,$data['field']);
		}

		$dir=ITE_ROOT."/cache/".$this->getRequest()->getSession()->getId();
		if(!file_exists($dir)){
			mkdir($dir,0777,true);
		}
		$pdf->Output($dir.'/output.pdf', "F");

		//save metadata
		$this->saveMetadata($entity,$data['field']);
		return $this->redirect('/form/finish');
	}

	private function getAESEncoder(){
		$pkcs7 = new PKCS7();
		$aescbc = new AES_CBC_Mcrypt($pkcs7);
		$util   = new Util();
		$aescbc->setKey($this->getService('config')->get('aesKey'));
		$aescbc->setIv($this->getService('config')->get('aesIV'));

		return $aescbc;

	}

	private function saveMetadata($form,$fields){
		$dir=ITE_ROOT."/cache/".$this->getRequest()->getSession()->getId();
		$data=array();
		$data['form']=$form->getId();
		$data['data']=$fields;
		$encodeData=json_encode($data);

		$aescbc=$this->getAESEncoder();
		$cipherText  = $aescbc->encrypt($encodeData);
		$fOpen=fopen($dir.'/metadata.scbk', 'wb');
		flock($fOpen,\LOCK_EX);
		fwrite($fOpen, $cipherText);
		flock($fOpen,\LOCK_UN);
		fclose($fOpen);

	}

	private function createForm(){
		$form=$this->getService('form')->create();
		$form->setValidatorService($this->getService('validator'));
		$form->setFormatter(new PdfEditorFormFormatter());
		return $form;
	}

	private function createUploadForm($entity){
		$build=$this->getService('form')->create();
		$build->setValidatorService($this->getService('validator'));
		$formatter=new BootstrapFormFormatter();
		$formatter->addButton('Create manualy','default','create');
		$build->setFormatter($formatter);
		$build->addField(new FileField(array(
			'name'=>'file'
			,'label'=>'Metadata'
			,'required'=>false
			)));

		$build->submit($this->getRequest());

		return $build;

	}

	private function getViewFile($entity){
		$opendir=opendir($entity->getDir());
		while($readdir=readdir($opendir)){
			if(!preg_match('/^view-\d\.jpg$/', $readdir)){
				continue;
			}
			$result[]=$entity->getId().'/'.$readdir;

		}

		closedir($opendir);
		sort($result);
		return $result;

	}

	public function finish(){
		try{
			$this->getRequest()->getSession()->remove('values');
		}
		catch(ValueNotFoundException $e){
			//ignore
		}
		
		return array();
	}

	public function finishPdf($view){
		$file=ITE_ROOT."/cache/".$this->getRequest()->getSession()->getId().'/output.pdf';

		$response=new Response();
		$response->setHeader('Content-Type','application/pdf');
		if(!$view){
			$response->setHeader('Content-Disposition','attachment; filename="output.pdf"');
		}
		$response->setContent($file);
		return $response;
	}

	public function finishScbk(){
		$file=ITE_ROOT."/cache/".$this->getRequest()->getSession()->getId().'/metadata.scbk';

		$response=new Response();
		$response->setHeader('Content-Type','application/scbk');
		$response->setHeader('Content-Disposition','attachment; filename="metadata.scbk"');
		$response->setContent($file);
		return $response;
	}

	public function image($entity,$image){
		$dir=$entity->getDir();
		$response=new Response();
		$response->setContent($dir.'/'.$image);
		return $response;
	}

	private function preparePage($pdf,$page,$fieldMap,$data){
		//scale
		$scale=$pdf->getPageWidth()/595;
		// echo $scale; exit;
		foreach($fieldMap as $index=>$fieldMap){
			if($fieldMap->getPage()!=$page){
				continue;
			}

			$pdf->SetFont('cousine','N',$fieldMap->getFontSize());
			$pdf->setFontSpacing(($fieldMap->getSpace())*$scale);
			//Print centered cell with a text in it
			$pdf->Text(($fieldMap->getPositionX()+$fieldMap->getSpace())*$scale,($fieldMap->getPositionY()+4)*$scale, $data[$index]);

		}


	}


}