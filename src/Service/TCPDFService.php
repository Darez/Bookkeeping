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

use ItePHP\Core\Environment;

class TCPDFService{

    /**
     * TCPDFService constructor.
     * @param Environment $environment
     */
    public function __construct(Environment $environment)
    {
        require_once $environment->getVendorPath().'/tecnickcom/tcpdf/tcpdi.php';
    }

    public function create(){
		return new \TCPDI(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
	}

}