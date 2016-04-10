<?php

namespace Entity;

/**
 * @Entity()
 * @Table(name="forms")
 **/
class Form{

	/** 
	 * @Id
	 * @Column(type="integer") 
	 * @GeneratedValue
	 **/
	protected $id;

    /** 
     * @Column(name="call_id",type="string") 
     **/
    protected $name;

    /** 
     * @Column(type="text") 
     **/
    protected $dir;

	public function getId(){
		return $this->id;
	}


    public function getName(){
        return $this->name;
    }

    public function setName($name){
        $this->name=$name;
        return $this;
    }

    public function getDir(){
        return $this->dir;
    }

    public function setDir($dir){
        $this->dir=$dir;
        return $this;
    }

}