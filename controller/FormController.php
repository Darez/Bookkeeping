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


		$pdf->Output(__DIR__."/../cache/my_modified_pdf.pdf", "F");		
	}

	private function preparePage($pdf,$page,$fieldMap,$data){
		//scale
		$scale=$pdf->getPageWidth()/595;
		foreach($fieldMap as $index=>$fieldMap){
			if($fieldMap->getPage()!=$page){
				continue;
			}
			$pdf->SetX($fieldMap->getPositionX()*$scale);
			$pdf->SetY($fieldMap->getPositionY()*$scale);

			$pdf->SetFont('helvetica','N',10);
			//Print centered cell with a text in it
			$pdf->Text($fieldMap->getPositionX()*$scale,$fieldMap->getPositionY()*$scale, $data[$index]);

		}


	}

}