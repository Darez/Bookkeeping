<?php

namespace Entity;
use Doctrine\Common\Collections\ArrayCollection;

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
     * @Column(name="name",type="string") 
     **/
    protected $name;

    /** 
     * @Column(type="text") 
     **/
    protected $dir;

    /**
     * @OneToMany(targetEntity="FormField", mappedBy="form")
     */
    protected $fields;

    public function __construct(){
        $this->fields=new ArrayCollection();
    }

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

    public function getFields(){
        return $this->fields;
    }

}