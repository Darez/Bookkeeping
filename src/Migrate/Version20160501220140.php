<?php

namespace Migrate;
use ItePHP\Command\Migrate;

class Version20160501220140{
	
	public function up(Migrate $migrate){

		$sql="CREATE SEQUENCE forms_id_seq INCREMENT BY 1 MINVALUE 1 START 1;
			CREATE SEQUENCE form_fields_id_seq INCREMENT BY 1 MINVALUE 1 START 1;
			CREATE TABLE forms (id INT NOT NULL, call_id VARCHAR(255) NOT NULL, dir TEXT NOT NULL, PRIMARY KEY(id));
			CREATE TABLE form_fields (id INT NOT NULL, form_id INT NOT NULL, call_id VARCHAR(255) NOT NULL, page INT NOT NULL, position_x INT NOT NULL, position_y INT NOT NULL, font_size INT NOT NULL, max_length INT DEFAULT NULL, space DOUBLE PRECISION NOT NULL, PRIMARY KEY(id));
			CREATE INDEX IDX_7C0B37265FF69B7D ON form_fields (form_id);
			ALTER TABLE form_fields ADD CONSTRAINT FK_7C0B37265FF69B7D FOREIGN KEY (form_id) REFERENCES forms (id) NOT DEFERRABLE INITIALLY IMMEDIATE;";

		$stmt=$migrate->getConnection();
		$stmt->exec($sql);

	}

	public function down(Migrate $migrate){

		$sql="DROP SEQUENCE forms_id_seq;
			DROP SEQUENCE form_fields_id_seq;
			DROP TABLE form_fields;
			DROP TABLE forms;";

		$stmt=$migrate->getConnection();
		$stmt->exec($sql);

	}

}