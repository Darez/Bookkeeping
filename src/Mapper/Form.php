<?php

namespace Mapper;
use Exception\FormNotFoundException;
use ItePHP\Mapper\MapperAbstract;

/**
 * Cast id to Entity\Form
 *
 * @package Mapper
 */
class Form extends MapperAbstract {
	
	/**
	 * {@inheritdoc}
	 */
	public function cast($value){
		$entity=$this->container->getService('doctrine')->getEntityManager()->getRepository('Entity\Form')->findOneById($value);
		if(!$entity){
            throw new FormNotFoundException();
        }

		return $entity;
	}
}