<?php

namespace Controller;
use Entity\Form;
use ItePHP\Action\ValueNotFoundException;
use ItePHP\Component\Form\FileUploaded;
use ItePHP\Component\Form\FormBuilder;
use ItePHP\Core\Controller;
use ItePHP\Component\Form\TextField;
use ItePHP\Component\Form\FileField;
use Formatter\PdfEditorFormFormatter;
use Formatter\BootstrapFormFormatter;

use ItePHP\Core\Response;
use phpaes\PKCS7;
use phpaes\AES_CBC_Mcrypt;

/**
 * Class FormController
 * @package Controller
 */
class FormController extends Controller{

    /**
     * @param Form $entity
     * @return array
     */
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
		$dir=$this->getEnvironment()->getCachePath().'/'.$request->getSession()->getId();

        /**
         * @var FileUploaded $file
         */
        $file=$data['file'];
		$file->save($dir,'metadata.scbk');

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

    /**
     * @param Form $entity
     * @return mixed
     */
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

        /**
         * @var \TCPDI $pdf
         */
		$pdf =$this->getService('fpdf');

		//Set the source PDF file
		$pagecount = $pdf->setSourceFile($entity->getDir().'/raw.pdf');
		// $fontname = \TCPDF_FONTS::addTTFfont(__DIR__.'/../web/fonts/cousine/Cousine-Regular.ttf');
		for($i=1; $i<=$pagecount; $i++){
			$pdf->setPrintHeader(false);
			$pdf->setPrintFooter(false);
			$pdf->SetAutoPageBreak(TRUE, 0);
			$pdf->AddPage();
			$tpl = $pdf->importPage($i);
			$pdf->useTemplate($tpl);

			$this->preparePage($pdf,$i,$fieldMap,$data['field']);
		}

		$dir=$this->getEnvironment()->getCachePath()."/".$this->getRequest()->getSession()->getId();
		if(!file_exists($dir)){
			mkdir($dir,0777,true);
		}
		$pdf->Output($dir.'/output.pdf', "F");

		//save metadata
		$this->saveMetadata($entity,$data['field']);
		return $this->redirect('/form/finish');
	}

    /**
     * @return AES_CBC_Mcrypt
     */
	private function getAESEncoder(){
		$pkcs7 = new PKCS7();
		$aescbc = new AES_CBC_Mcrypt($pkcs7);
        $aesNode=$this->getConfig()->getNodes('aes');
        $aesNode=$aesNode[0];
		$aescbc->setKey($aesNode->getAttribute('key'));
		$aescbc->setIv($aesNode->getAttribute('iv'));

		return $aescbc;

	}

    /**
     * @param Form $form
     * @param array $fields
     */
	private function saveMetadata($form,$fields){
		$dir=$this->getEnvironment()->getCachePath()."/".$this->getRequest()->getSession()->getId();
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

    /**
     * @return FormBuilder
     */
	private function createForm(){
		$form=$this->getService('form');
		$form->setFormatter(new PdfEditorFormFormatter());
		return $form;
	}

    /**
     * @param Form $entity
     * @return object
     */
	private function createUploadForm($entity){
		$build=$this->getService('form');
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

    /**
     * @param Form $entity
     * @return array
     */
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
		$file=$this->getEnvironment()->getCachePath()."/".$this->getRequest()->getSession()->getId().'/output.pdf';

		$response=new Response();
		$response->setHeader('Content-Type','application/pdf');
		if(!$view){
			$response->setHeader('Content-Disposition','attachment; filename="output.pdf"');
		}
		$response->setContent($file);
		return $response;
	}

	public function finishScbk(){
		$file=$this->getEnvironment()->getCachePath()."/".$this->getRequest()->getSession()->getId().'/metadata.scbk';

		$response=new Response();
		$response->setHeader('Content-Type','application/scbk');
		$response->setHeader('Content-Disposition','attachment; filename="metadata.scbk"');
		$response->setContent($file);
		return $response;
	}

    /**
     * @param Form $entity
     * @param string $image
     * @return Response
     */
	public function image($entity,$image){
		$dir=$entity->getDir();
		$response=new Response();
		$response->setContent($dir.'/'.$image);
		return $response;
	}

    /**
     * @param TCPDI $pdf
     * @param int $page
     * @param array $fieldMaps
     * @param array $data
     */
	private function preparePage($pdf,$page,$fieldMaps,$data){
		//scale
		$scale=$pdf->getPageWidth()/595;
		// echo $scale; exit;
		foreach($fieldMaps as $index=>$fieldMap){
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