<?php

namespace Migrate;
use ItePHP\Command\Migrate;

class Version20160503224142{
	
	public function up(Migrate $migrate){

		$sql="ALTER TABLE forms RENAME COLUMN call_id TO name;
		ALTER TABLE form_fields ADD width DOUBLE PRECISION NOT NULL;
		ALTER TABLE form_fields DROP call_id;";

		$stmt=$migrate->getConnection();
		$stmt->exec($sql);
	}

	public function down(Migrate $migrate){
		$sql="ALTER TABLE forms RENAME COLUMN name TO call_id;
		ALTER TABLE form_fields DROP width;
		ALTER TABLE form_fields ADD call_id VARCHAR(255) NOT NULL DEFAULT 'Auto generate';";

		$stmt=$migrate->getConnection();
		$stmt->exec($sql);
	}

}