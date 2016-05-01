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

require_once __DIR__.'/../vendor/autoload.php';

array_shift($argv);
$env='prod';
$debug=false;
if(file_exists(__DIR__.'/../dev')){
	$env='dev';
	$debug=true;
}
$root=new \ItePHP\Root($debug,true,$env);
$sigint=$root->executeCommand($argv);

exit($sigint);
