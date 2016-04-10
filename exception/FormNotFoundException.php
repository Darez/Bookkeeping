<?php

namespace Exception;

use Arbor\Core\Exception;

/**
 * @package Exception
 */
class FormotFoundException extends Exception{
	
	public function __construct(){
		parent::__construct(1,'Form not found.');
	}

}