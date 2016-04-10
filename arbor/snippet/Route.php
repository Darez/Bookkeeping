<?php

/**
 * ArborPHP: Freamwork PHP (http://arborphp.com)
 * Copyright (c) NewClass (http://newclass.pl)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the file LICENSE
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) NewClass (http://newclass.pl)
 * @link          http://arborphp.com ArborPHP Project
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

namespace Arbor\Snippet;
use Arbor\Provider\Response;
use Arbor\Core\Container;

class Route {
	
	/**
	 * create response with configure redirect action
	 *
	 * @param \Arbor\Core\Container $container
	 * @param string $url - destiny http address
	 * @return \Arbor\Provider\Response
	 */
	public function redirect(Container $container,$url){
		$response=new Response();
		$response->redirect($url);
		return $response;
	}

}
