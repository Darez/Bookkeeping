Ite.registerElement('IteFormElement','form',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.isDirty=false;
	prv.scope=(parent!=undefined?parent:pub);

	//extend
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	/**
	 * @depreceted
	 */
	pub.setValues=function(values){
		for(var key in values){
			pub.get("[name='"+key+"']").setValue(values[key]);
		}		
	};

	pub.setData=function(values){
		for(var key in values){
			pub.getField(key).setData(values[key]);
		}
	};

	pub.clearData=function(){
		pub.getAll('input','select','textarea').each(function(item){
			item.setData('');
		});
	};

	/**
	 * @depreceted
	 */
	pub.getValues=function(){
		var values={};
		var contenerBranch={};
		var match;
		pub.getAll('input','select','textarea').each(function(field){
			var fieldName=field.getName();
			if(fieldName!='' && !field.isDisabled() && field.getValue()!=null){
				contenerBranch=values;
				var nameParts=new RegExp('^([^\\[]+)(\\[(.*)\\]){0,1}$','g').exec(fieldName);
				var deep=[nameParts[1]];
				if(nameParts[2]!=undefined){
					var reArray=new RegExp('\\[([^\\[]*)\\]','g');
					while((match=reArray.exec(nameParts[2])) && match[1]!=''){
						deep.push(match[1]);
					}

				}

				for(var i=0; i <deep.length; i++){
					if(contenerBranch[deep[i]]==undefined){

						if(deep[i+1]=='')
							contenerBranch[deep[i]]=[];						
						else
							contenerBranch[deep[i]]={};
					}
					if(deep.length-1==i){

						if(deep[i]=='')//obsługa name[] - bez numerowania
							contenerBranch.push(field.getValue());
						else
							contenerBranch[deep[i]]=field.getValue();

					}
					else{
						contenerBranch=contenerBranch[deep[i]]; //FIXME nie wiem czy tutaj też nie powinno odbywać się przez push gdy deep jest pusty
					}
				}					

			}

		});

		return values;
	}

	pub.getData=function(){
		var values={};
		var contenerBranch={};
		var match;
		pub.getAll('input','select','textarea').each(function(field){
			var fieldName=field.getName();
			if(fieldName!='' && !field.isDisabled() && field.getValue()!=null){
				contenerBranch=values;
				var nameParts=new RegExp('^([^\\[]+)(\\[(.*)\\]){0,1}$','g').exec(fieldName);
				var deep=[nameParts[1]];
				if(nameParts[2]!=undefined){
					var reArray=new RegExp('\\[([^\\[]*)\\]','g');
					while((match=reArray.exec(nameParts[2])) && match[1]!=''){
						deep.push(match[1]);
					}

				}

				for(var i=0; i <deep.length; i++){
					if(contenerBranch[deep[i]]==undefined){

						if(deep[i+1]=='')
							contenerBranch[deep[i]]=[];						
						else
							contenerBranch[deep[i]]={};
					}
					if(deep.length-1==i){

						if(deep[i]=='')//obsługa name[] - bez numerowania
							contenerBranch.push(field.getValue());
						else
							contenerBranch[deep[i]]=field.getValue();

					}
					else{
						contenerBranch=contenerBranch[deep[i]]; //FIXME nie wiem czy tutaj też nie powinno odbywać się przez push gdy deep jest pusty
					}
				}					

			}

		});

		return values;
	};
	//validator
	pub.isDirty=function(){
		return prv.isDirty;
	};

	pub.setDirty=function(flag){
		if(!prv.isDirty){
			prv.isDirty=flag;
			pub.checkFieldsValid();

		}
	};

	/**
	 * Get form field
	 * @param string name - field name
	 * @return IteFieldElement
	 * @since 1.0.0
	 */
	pub.getField=function(name){
		return pub.get('[name="'+name+'"]')
	}

	pub.getValidator=function(){
		if(!prv.validator){
			prv.validator=new IteValidator(pub);
			var validatorHelper=prv.helper.validator;
			var defaultRules=validatorHelper.defaultRules;
			for(var kRule in defaultRules){
				try{
					prv.validator.addRule(kRule,defaultRules[kRule]);
				}
				catch(e){
					//ignore
				}
			}

			prv.validator.setFieldListener(validatorHelper.fieldListener);
			prv.validator.setFormListener(validatorHelper.formListener);
		}


		return prv.validator;

	}

	pub.isValid=function(){
		if(prv.validator==undefined){
			throw new ValidatorNotFoundException();
		}

		return prv.validator.isValid();
	}

	pub.checkFieldsValid=function(){
		if(!prv.validator){ //FIXME mayby init validator in constructor class?
			return;
		}
		prv.validator.checkFieldsValid();
	}

	pub.setAction=function(action){
		pub.getDOMElement().action=action;
	}

	pub.setMethod=function(method){
		pub.getDOMElement().method=method;
	}

	pub.setTarget=function(target){
		pub.getDOMElement().target=target;
	}

	pub.submit=function(){
		pub.getDOMElement().submit();
	}
	//events
	pub.addEventSubmit=prv.helper.addEvent(prv.scope,'submit');

	//construct
	pub.addEventSubmit(function(e){
		pub.setDirty(true)
		e.setSystemHandle(true);
	});

});
