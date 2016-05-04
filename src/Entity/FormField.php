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
     * @ManyToOne(targetEntity="Form",inversedBy="fields")
     * @JoinColumn(name="form_id", referencedColumnName="id",nullable=false)
     **/
    protected $form;

    /** 
     * @Column(type="integer") 
     **/
    protected $page;

    /** 
     * @Column(name="position_x",type="integer") 
     **/
    protected $positionX;

    /** 
     * @Column(name="position_y",type="integer") 
     **/
    protected $positionY;

    /** 
     * @Column(name="font_size",type="integer") 
     **/
    protected $fontSize;

    /** 
     * @Column(name="max_length",type="integer",nullable=true) 
     **/
    protected $maxLength;

    /** 
     * @Column(name="space",type="float") 
     **/
    protected $space;

	public function getId(){
		return $this->id;
	}

    public function getForm(){
        return $this->form;
    }

    public function setForm($form){
        $this->form=$form;
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

    public function getFontSize(){
        return $this->fontSize;
    }

    public function setFontSize($fontSize){
        $this->fontSize=$fontSize;
        return $this;
    }

    public function getMaxLength(){
        return $this->maxLength;
    }

    public function setMaxLength($maxLength){
        $this->maxLength=$maxLength;
        return $this;
    }

    public function getSpace(){
        return $this->space;
    }

    public function setSpace($space){
        $this->space=$space;
        return $this;
    }

}