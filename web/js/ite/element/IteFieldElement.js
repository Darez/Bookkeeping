Ite.registerElement('IteFieldElement','input,textarea,button,select',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	pub.getForm=function(){
		return prv.helper.getObject(pub.getDOMElement().form);
	}

	pub.getValue=function(){
		if(pub.getType()=='select' && pub.isMultiple()){
			var result=[];
			new IteArray(pub.getDOMElement().options).each(function(option){
				if(option.selected)
					result.push(option.value);

			});

			return result;
		}
		else if(pub.getType()=='file'){
			return new IteArray(pub.getDOMElement().files);
		}
		else if(pub.getType()=='radio'){
			var fieldSelected;
			Ite.getAll("[name='"+pub.getName()+"']").each(function(item){
				if(item.isChecked()){
					fieldSelected=item;
					return true;
				}
			});

			if(fieldSelected)
				return pub.getDOMElement().value;
			return false;
		}
		else if(pub.getType()!='checkbox' || pub.isChecked())
			return pub.getDOMElement().value;
		return null;
	}

	pub.getCursorPosition=function(){
		if(pub.getDOMElement().selectionStart==pub.getDOMElement().selectionEnd)
			return pub.getDOMElement().selectionStart;
		else
			return null;
	}

	pub.isMultiple=function(){
		if(pub.getType()=='select' && pub.getDOMElement().multiple)
			return true;
		return false;
	}

	/**
	 * @arg value - data to set tag "value"
	 * @arg silent - if true then dont execute event
	*/
	pub.setValue=function(value,silent){

		pub.getDOMElement().value=value;
		if(!silent){
			if(pub.getTag()=='SELECT' || pub.getTag()=='BUTTON' || (pub.getTag()=='INPUT' && pub.getType()=='checkbox'))
				pub.fireEvent('change');
			else{
				pub.fireEvent('keypress');
				pub.fireEvent('keydown');
				pub.fireEvent('keyup');

			}			
		}


	}

	pub.setData=function(value,silent){
		if(pub.getTag()=='INPUT' && pub.getType()=='checkbox'){
			pub.setChecked(value==true || value=='on');
		}
		else{
			pub.setValue(value);
		}

	};

	pub.getType=function(){
		if(pub.getTag()=='SELECT')
			return 'select';
		else if(pub.getTag()=='TEXTAREA')
			return 'textarea';
		else
			return pub.getAttribute('type');
	}

	pub.setType=function(type){
		return pub.setAttribute('type',type);
	}

	pub.getName=function(){
		return pub.getDOMElement().name
	}

	pub.getMin=function(){
		return pub.getDOMElement().getAttribute('min');
	}

	pub.setMin=function(min){
		var variable=min;
		if(variable.constructor.name=='Date'){
			var yyyy = variable.getFullYear().toString();                                    
			var mm = (variable.getMonth()+1).toString();
			var dd  = variable.getDate().toString();             
			variable=yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
		}

		pub.setAttribute('min',variable);
	}

	pub.getMax=function(){
		return pub.getDOMElement().getAttribute('max');
	}

	pub.setMax=function(max){
		var variable=max;
		if(variable.constructor.name=='Date'){
			var yyyy = variable.getFullYear().toString();                                    
			var mm = (variable.getMonth()+1).toString();
			var dd  = variable.getDate().toString();             
			variable=yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
		}
		pub.setAttribute('max',variable);
	}

	pub.isRequired=function(){
		return pub.getDOMElement().required
	}

	pub.setRequired=function(flag){
		if(flag)
			return pub.getDOMElement().required='t';
		return pub.getDOMElement().required=null;

	}

	pub.setName=function(name){
		return pub.getDOMElement().name=name;

	}

	pub.isChecked=function(){
		return pub.getDOMElement().checked;
	}

	pub.setChecked=function(flag,silent){
		pub.getDOMElement().checked=flag;
		if(!silent){
			pub.fireEvent('change');
		}

	}

	pub.getMaxLength=function(){
		return pub.getAttribute('maxlength');
	}

	pub.setMaxLength=function(maxlength){
		pub.setAttribute('maxlength',maxlength);
	}

	pub.getPattern=function(){
		return pub.getAttribute('pattern');
	}

	pub.setDisabled=function(flag){
		if(flag){
			pub.setAttribute('disabled',"disable");
		}
		else{
			pub.removeAttribute('disabled');
		}
	}

	pub.isDisabled=function(flag){
		 return pub.getDOMElement().disabled;
	}

	pub.setReadOnly=function(flag){
		pub.getDOMElement().readOnly=flag;
	}

	pub.isReadOnly=function(){
		 return prv.getDOMElement().readOnly;
	}

	pub.addEventFocus=prv.helper.addEvent(prv.scope,'focus');

	pub.addEventBlur=prv.helper.addEvent(prv.scope,'blur');

});
