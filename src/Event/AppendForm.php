<?php

namespace Event;

use ItePHP\Core\ExecutePresenterEvent;
use ItePHP\Doctrine\DoctrineService;
use ItePHP\Twig\TwigPresenter;

/**
 * Event to append forms for build menu. Only for twig presenter.
 *
 * @author Michal Tomczak (michal.tomczak@itephp.com)
 */
class AppendForm{

    /**
     * @var DoctrineService
     */
    private $doctrine;

    /**
     * AppendForm constructor.
     * @param DoctrineService $doctrineService
     */
    public function __construct(DoctrineService $doctrineService){
        $this->doctrine=$doctrineService;
    }

    /**
     * @param ExecutePresenterEvent $event
     */
    public function onExecutePresenter(ExecutePresenterEvent $event){

		$response=$event->getResponse();
		if($response->getPresenter() instanceof TwigPresenter){
			$content=$response->getContent();
			$content['_forms']=$this->doctrine->getEntityManager()->getRepository('Entity\Form')->findAll();
			$response->setContent($content);
		}
	}
}