<?php

/**
 * ItePHP: Framework PHP (http://itephp.com)
 * Copyright (c) NewClass (http://newclass.pl)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the file LICENSE
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) NewClass (http://newclass.pl)
 * @link          http://itephp.com ItePHP Project
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */
namespace Service;

use ItePHP\Contener\ServiceConfig;
use ItePHP\Core\EventManager;

class ConfigService{
	
	private $serviceConfig;

	public function __construct(ServiceConfig $serviceConfig,EventManager $eventManager){
		$this->serviceConfig=$serviceConfig;
	}

	public function get($key){
		return $this->serviceConfig->get($key);
	}

}