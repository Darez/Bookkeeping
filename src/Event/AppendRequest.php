<?php

namespace Event;

use ItePHP\Core\ExecutePresenterEvent;
use ItePHP\Twig\TwigPresenter;

/**
 * Event to append request object. Only for twig presenter.
 *
 * @author Michal Tomczak (michal.tomczak@itephp.com)
 */
class AppendRequest{
	
	public function onExecutePresenter(ExecutePresenterEvent $event){

		$response=$event->getResponse();
		if($response->getPresenter() instanceof TwigPresenter){
			$request=$event->getRequest();
			$content=$response->getContent();
			$content['_request']=$request;
			$response->setContent($content);
		}
	}
}