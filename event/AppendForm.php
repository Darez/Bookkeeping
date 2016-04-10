<?php

namespace Event;

use Arbor\Core\Event;
use Arbor\Provider\Response;
use Arbor\Event\ExecutePresenterEvent;
use Arbor\Exception\ValueNotFoundException;
use Arbor\Exception\InvalidConfigValueException;
use Arbor\Exception\RequiredArgumentException;
use Arbor\Exception\InvalidArgumentException;
use Arbor\Core\RequestProvider;

/**
 * Event to append forms for build menu. Only for twig presenter.
 *
 * @author Michal Tomczak (michal.tomczak@arborphp.com)
 * @since 1.0.0
 */
class AppendForm extends Event{
	
	/**
	 * main method
	 *
	 * @param \Arbor\Event\ExecutePresenterEvent $event
	 * @since 1.0.0
	 */
	public function onExecutePresenter(ExecutePresenterEvent $event){

		$response=$event->getResponse();
		if($response->getPresenter() instanceof \Library\Twig\Presenter\Twig){
			$request=$event->getRequest();
			$content=$response->getContent();
			$content['_forms']=$this->find('Form');
			$response->setContent($content);
		}
	}
}