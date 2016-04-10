<?php

namespace Entity;

/**
 * @Entity()
 * @Table(name="form_fields")
 **/
class FormField{

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
     * @Column(type="int") 
     **/
    protected $page;

    /** 
     * @Column(name="position_x",type="int") 
     **/
    protected $positionX;

    /** 
     * @Column(name="position_y",type="int") 
     **/
    protected $positionY;

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

    public function getPage(){
        return $this->page;
    }

    public function setPage($page){
        $this->page=$page;
        return $this;
    }

    public function getPositionX(){
        return $this->positionX;
    }

    public function setPositionX($positionX){
        $this->positionX=$positionX;
        return $this;
    }

    public function getPositionY(){
        return $this->positionY;
    }

    public function setPositionY($positionY){
        $this->positionY=$positionY;
        return $this;
    }

}