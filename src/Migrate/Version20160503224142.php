<?php

namespace Migrate;

use ItePHP\Core\Container;

class Version20160503224142{
	
	public function up(Container $container){

		$sql="ALTER TABLE forms RENAME COLUMN call_id TO name;
		ALTER TABLE form_fields DROP call_id;";

        $stmt=$container->getService('doctrine')->getEntityManager()->getConnection();
		$stmt->exec($sql);
	}

	public function down(Container $container){
		$sql="ALTER TABLE forms RENAME COLUMN name TO call_id;
		ALTER TABLE form_fields ADD call_id VARCHAR(255) NOT NULL DEFAULT 'Auto generate';";

        $stmt=$container->getService('doctrine')->getEntityManager()->getConnection();
		$stmt->exec($sql);
	}

}