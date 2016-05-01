<?php

namespace Event;

use ItePHP\Core\Event;
use ItePHP\Provider\Response;
use ItePHP\Event\ExecutePresenterEvent;
use ItePHP\Exception\ValueNotFoundException;
use ItePHP\Exception\InvalidConfigValueException;
use ItePHP\Exception\RequiredArgumentException;
use ItePHP\Exception\InvalidArgumentException;
use ItePHP\Core\RequestProvider;

/**
 * Event to append forms for build menu. Only for twig presenter.
 *
 * @author Michal Tomczak (michal.tomczak@itephp.com)
 * @since 1.0.0
 */
class AppendForm extends Event{
	
	/**
	 * main method
	 *
	 * @param \ItePHP\Event\ExecutePresenterEvent $event
	 * @since 1.0.0
	 */
	public function onExecutePresenter(ExecutePresenterEvent $event){

		$response=$event->getResponse();
		if($response->getPresenter() instanceof \ItePHP\Twig\Presenter){
			$request=$event->getRequest();
			$content=$response->getContent();
			$content['_forms']=$this->find('Form');
			$response->setContent($content);
		}
	}
}