<?php

/*
 * This file is part of the ArborPHP.
 * Copyright (c) NewClass (http://newclass.pl)
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Library\Fpdf\Service;

use Library\Doctrine\EventHandler;
use Arbor\Contener\ServiceConfig;
use Arbor\Core\EventManager;

require_once __DIR__.'/../tcpdf.php';
require_once __DIR__.'/../tcpdi.php';

class FpdfService{
	

	public function __construct(ServiceConfig $serviceConfig,EventManager $eventManager){

	}

	public function create(){
		return new \TCPDI(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
	}
}