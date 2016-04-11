<?php

namespace Formatter;

use Arbor\Component\Form\FormFormatter;
use Arbor\Component\Form\FormField;

class PdfEditorFormFormatter implements FormFormatter{

	/**
	 * {@inheritdoc}
	 */
	public function renderField(FormField $field){
		$tags=$field->getTags();
		$template='<div role="pdf-preview-component" ';

		foreach($tags as $kTag=>$tag){
			if(substr($kTag, 0,5)=='data-'){
				$template.=$kTag.'="'.$tag.'" ';				
			}
		}

		$template.='></div>';

		return $template;
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderFormBegin($tags){
		return '';
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderFormEnd(){
		return '';
	}

	/**
	 * {@inheritdoc}
	 */
	public function renderSubmit($tags){
		return '';
	}
}