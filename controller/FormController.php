<?php

namespace Controller;
use Arbor\Core\Controller;
use Arbor\Component\Form\TextField;
use Arbor\Component\Form\FileField;
use Formatter\BootstrapFormFormatter;
use Arbor\Exception\ValueNotFoundException;
use Arbor\Provider\Response;
use Formatter\BasicGridFormatter;
use Manager\BasicDataManager;
use Formatter\ActionColumnFormatter;
use Arbor\Component\Grid\Column;

class FormController extends Controller{
	
	public function index($entity){
		$form=$this->getService('form')->create();
		$form->setValidatorService($this->getService('validator'));
		$form->setFormatter(new BootstrapFormFormatter());

		$fields=$entity->getFields();
		$fieldMap=array();
		foreach($entity->getFields() as $kField=>$field){
			$form->addField(new TextField(array(
				'name'=>'field['.$kField.']'
				,'label'=>$field->getName()
				,'required'=>true
				)));

			$fieldMap[$kField]=$field;
		}

		$form->submit($this->getRequest());

		if(!$form->isValid()){
			return compact('form');			
		}

		$data=$form->getData();
		$pdf =$this->getService('fpdf')->create();

		//Set the source PDF file
		$pagecount = $pdf->setSourceFile($entity->getDir().'/raw.pdf');

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

	private function preparePage($pdf,$page,$fieldMap,$data){
		//scale
		$scale=$pdf->getPageWidth()/595;
		foreach($fieldMap as $index=>$fieldMap){
			if($fieldMap->getPage()!=$page){
				continue;
			}

			$pdf->SetFont('freesans','N',$fieldMap->getFontSize());
			$pdf->setFontSpacing($fieldMap->getSpace()*$scale);
			//Print centered cell with a text in it
			$pdf->Text($fieldMap->getPositionX()*$scale,($fieldMap->getPositionY()+2)*$scale, $data[$index]);

		}


	}

}