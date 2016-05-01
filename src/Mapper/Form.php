<?php

namespace Mapper;
use ItePHP\Core\Mapper;
use Exception\FormNotFoundException;

/**
 * Cast id to Entity\Form
 *
 * @package Mapper
 */
class Form extends Mapper{
	
	/**
	 * {@inheritdoc}
	 */
	public function cast($value){
		$entity=$this->getService('doctrine')->getEntityManager()->getRepository('Entity\Form')->findOneById($value);
		if(!$entity)
			throw new FormNotFoundException();

		return $entity;
	}
}