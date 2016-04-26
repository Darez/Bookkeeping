<?php

namespace Controller;
use Arbor\Core\Controller;
use Arbor\Component\Form\TextField;
use Arbor\Component\Form\FileField;
use Formatter\PdfEditorFormFormatter;
use Arbor\Exception\ValueNotFoundException;
use Arbor\Provider\Response;
use Formatter\BasicGridFormatter;
use Manager\BasicDataManager;
use Formatter\ActionColumnFormatter;
use Arbor\Component\Grid\Column;

class FormController extends Controller{
	
	public function index($entity){

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
			$pdf->AddPage();
			$tpl = $pdf->importPage($i);
			$pdf->useTemplate($tpl);

			$this->preparePage($pdf,$i,$fieldMap,$data['field']);
		}

		$dir=__DIR__."/../cache/".$this->getRequest()->getSession()->getId();
		if(!file_exists($dir)){
			mkdir($dir,0777,true);
		}
		$pdf->Output($dir.'/output.pdf', "F");

		return $this->redirect('/form/finish');
	}

	private function createForm(){
		$form=$this->getService('form')->create();
		$form->setValidatorService($this->getService('validator'));
		$form->setFormatter(new PdfEditorFormFormatter());
		return $form;
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
		return compact('dir');
	}

	public function finishPdf(){
		$file=__DIR__."/../cache/".$this->getRequest()->getSession()->getId().'/output.pdf';

		$response=new Response();
		$response->setHeader('Content-Type','application/pdf');
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
		foreach($fieldMap as $index=>$fieldMap){
			if($fieldMap->getPage()!=$page){
				continue;
			}

			$pdf->SetFont('cousine','N',$fieldMap->getFontSize());
			$pdf->setFontSpacing($fieldMap->getSpace()*$scale);
			//Print centered cell with a text in it
			$pdf->Text(($fieldMap->getPositionX()-2)*$scale,($fieldMap->getPositionY()+2)*$scale, $data[$index]);

		}


	}


}