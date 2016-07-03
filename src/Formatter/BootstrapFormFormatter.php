<?php

namespace Formatter;

use ItePHP\Component\Form\FormFormatter;
use ItePHP\Component\Form\FormField;

class BootstrapFormFormatter implements FormFormatter{

	private $buttons=array();

	public function addButton($label,$class,$name){
		$this->buttons[]=array(
			'label'=>$label,
			'class'=>$class,
			'name'=>$name,
			);
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderField(FormField $field){

            
		$field->addClass('form-control');
		$field->addClass('input-transparent');
		$tags=$field->getTags();
		$groupClass='form-group';
		if(isset($tags['disabled']) && $tags['disabled']){
			$groupClass.=' hide';
		}

		if(!$field->isValid()){
			$groupClass.=' has-error';
		}

		$html='<div class="'.$groupClass.'">
			<label class="col-sm-4 control-label" for="'.$field->getId().'">'.$field->getLabel().'</label>
			<div class="col-sm-5">
			'.$field->componentRender().'
			'.(!$field->isValid()?'<label for="name" class="error">'.$field->getError().'</label>':'').'
			</div>
		</div>';

		return $html;
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderFormBegin($tags){
		if(!isset($tags['class'])){
			$tags['class']='';
		}

		$tags['class'].=' form-horizontal form-label-left';

		$template='<FORM ';
		foreach($tags as $kTag=>$tag){
			if($tag!='')
				$template.=$kTag.'="'.$tag.'" ';
		}

		$template.=' >';



		return $template;
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderFormEnd(){
		return '</FORM>';
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderSubmit($tags){
		if(!isset($tags['class'])){
			$tags['class']='';
		}

		$tags['class'].=' btn btn-danger';

		$button='<BUTTON ';
		$label=$tags['value'];
		unset($tags['value']);
		foreach($tags as $kTag=>$tag){
			if($tag!='')
				$button.=$kTag.'="'.$tag.'" ';
		}
		$button.='name="button" value="submit"';
		$button.='>'.$label.'</BUTTON>';
		foreach($this->buttons as $buttonOpt){
			$button.='&nbsp;<BUTTON name="button" value="'.$buttonOpt['name'].'" class="btn btn-default '.$buttonOpt['class'].'"';
			$button.='>'.$buttonOpt['label'].'</BUTTON>';

		}

		return '<div class="form-actions"><div class="row"><div class="col-md-8 col-md-offset-4">
						'.$button.'
					</div>
                </div>
			</div>';
	}
}