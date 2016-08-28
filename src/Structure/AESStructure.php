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

namespace Structure;

use ItePHP\Config\ConfigBuilder;
use ItePHP\Config\ConfigBuilderNode;
use ItePHP\Structure\Structure;

/**
 * Structure for AES.
 *
 * @author Michal Tomczak (michal.tomczak@itephp.com)
 */
class AESStructure implements Structure {

    /**
     * {@inheritdoc}
     */
    public function doConfig(ConfigBuilder $configBuilder){
        $variableNode=new ConfigBuilderNode('aes');
        $variableNode->addAttribute('key');
        $variableNode->addAttribute('iv');

        $configBuilder->addNode($variableNode);
    }
}