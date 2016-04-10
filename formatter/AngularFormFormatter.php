<?php

namespace Formatter;

use Arbor\Component\Form\FormFormatter as FormFormatterInterface;
use Arbor\Component\Form\FormField;

class AngularFormFormatter implements FormFormatterInterface{



	public function renderFormBegin($tags){

		$template='<FORM ';
		 
		foreach($tags as $kTag=>$tag){
			if($tag!='')
				$template.=$kTag.'="'.$tag.'" ';
		}

		$template.='(ngSubmit)="onSubmit()" [ngFormModel]="model"';

		$template.=' >';

		$template.='<div *ngIf="!valid"  
        class="ui error message">Niepoprawne dane</div>';

		return $template;
	}

	public function renderFormEnd(){
		return '</FORM>';
	}

	public function renderSubmit($tags){
		return '<BUTTON class="btn btn-primary">'.$tags['value'].'</BUTTON>';
	}


	public function renderField(FormField $field){
		$tags=$field->getTags();
		$icon=null;
		if(isset($tags['icon'])){
			$icon=$tags['icon'];
			unset($tags['icon']);
		}

		$field->addClass('form-control');
		$html='<div class="form-group">
			<label for="'.$field->getId().'">'.$field->getLabel().'</label>';

		$html.=$field->componentRender();
		$html.='</div>';

		return $html;
	}

}