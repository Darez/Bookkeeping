var Ite= new (function Ite(){
	"use strict";
	var prv={};
	var pub=this;
	prv.helper={};

	prv.validator=new IteValidatorManager(prv.helper);
	prv.storage=new IteStorage();
	prv.elementModules={};
	prv.currentObjectId=1;
	prv.helper.config=new IteConfig();
	prv.elements=[];
	prv.modules=new IteArray();
	prv.logger=new IteLogger();
	prv.clipboard=new IteClipboard();

	pub.try=function(callback){
		return new IteTryCatch(callback);
	};

	pub.logger=function(){
		return prv.logger;
	};

	pub.clipboard=function(){
		return prv.clipboard;
	};

	prv.helper.createObjectId=function(){
		return prv.currentObjectId++;
	};

	prv.helper.getObject=function(htmlElement){
		var element;
		if(htmlElement._ite)
			return htmlElement._ite;
		
		var parent=htmlElement.parentNode;
		if(parent==null){
			parent=document;
		}
		var iteObject=null;
		for(var objectName in prv.elements){
			var item=prv.elements[objectName];
			var elements=new IteArray(parent.querySelectorAll(item.getSelector()));//FIXME very slow execution
			elements.each(function(element){
				if(element==htmlElement){
					iteObject=objectName;
					return true;
				}
			});

		}
		element=new prv.elements[iteObject](prv.helper,htmlElement);

		if(prv.elementModules[iteObject]){
			for(var method in prv.elementModules[iteObject]){
				var func=prv.elementModules[iteObject][method];
				element[method]=func;
			}

		}

		htmlElement._ite=element;
		return element;
	}

	pub.extend=function(base,extend,htmlElement,scope){//FIXME trzeba poprawić jakoś proces dziedziczenia
		if(typeof extend === 'string')
			extend=new prv.elements[extend](prv.helper,htmlElement,scope);
		for(var method in extend){
			base[method]=extend[method];
		}

	}

	pub.setScrollPosition=function(top,left){
		pub.getDOMElement().scrollTo(top, left);
	}

	pub.getScrollTop=function(){
		return pub.get('body').getDOMElement().scrollTop;
	};

	pub.getScrollLeft=function(){
		return pub.get('body').getDOMElement().scrollLeft;
	};

	pub.openWindow=function(URL,name,specs,replace){
		return window.open(URL,name,specs,replace);
	}

	pub.getStorage=function(){
		return prv.storage;
	};

	pub.createObject=function(html,namespace){
		html=html.trim();
		if(html.substring(0,3)=='<tr'){
		//FIXME trzeba to jakoś inaczej opracować. Aktualnie zrobione na bardzo szybko
			var contener=null;
			if(namespace){
				contener=document.createElementNS(namespace,'table');
			}
			else{
				contener=document.createElement('table');				
			}
			contener.innerHTML=html;
			contener=contener.childNodes[0];
		}
		else if(html.substring(0,3)=='<th'){
			var contener=null;
			if(namespace){
				contener=document.createElementNS(namespace,'table');
			}
			else{
				contener=document.createElement('table');				
			}

			contener.innerHTML=html;
			contener=contener.childNodes[0].childNodes[0];
		}
		else{
			var contener=null;
			if(namespace){
				contener=document.createElementNS(namespace,'div');
			}
			else{
				contener=document.createElement('div');				
			}

			contener.innerHTML=html;
		}
		var nodes=contener.childNodes;
		if(nodes.length>1)
			throw new InvalidHtmlStructureException();
		return prv.helper.getObject(nodes[0]);
	}

	pub.createCollection=function(idField){
		return new IteCollection(idField);
	}

	pub.reload=function(){
		location.reload();
	}

	pub.getAll=function(){
		var result=new IteArray();
		for(var i=0; i <arguments.length; i++){
			var objects=document.querySelectorAll(arguments[i]);
			for(var j=0; j <objects.length; j++){

				result.push(prv.helper.getObject(objects[j]));
			}
		}

		return result
	}

	pub.get=function(pattern){
		var object=document.querySelector(pattern);

		if(object==null){
			throw new ObjectNotFoundException(pattern);
		}

		return prv.helper.getObject(object);
	}

	pub.validator=function(){
		return prv.validator;
	}

	pub.registerModule=function(name,func){
		var module=new func(prv.helper);
		prv.modules.push(module);
		pub[name]=function(){ 
			return module;
		};
	}

	pub.addElementModule=function(elementClassName,name,func){
		if(!prv.elementModules[elementClassName])
			prv.elementModules[elementClassName]={};

		prv.elementModules[elementClassName][name]=func;
	}

	pub.registerElement=function(name,selector,impl){
		impl.getSelector=function(){
			return selector;
		}
		prv.elements[name]=impl;
	}

	pub.blur=function(){
		document.activeElement.blur();
	}

	pub.setCursor=function(cursor){
		document.body.style.cursor=cursor;
	}

	pub.getDOMElement=function(){
		return window;
	}

	pub.escapeHtml=function(text){
		if(typeof text!="string"){
			return text;
		}

		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		text=text||'';
		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}

	pub.run=function(callback){
		callback.call(pub,prv.helper.config);
		prv.modules.each(function(item){
			if(typeof item.init=='function'){
				item.init.call();
			}
		});
	}

	//events
	prv.helper.addEvent=function(component,eventName,systemHandle){
		return function(callback){
			var element=component.getDOMElement();
			var initEpoch=new Date().getTime();
			if(element.addEventListener){
				element.addEventListener(eventName,function(e){
					//fixed Webkit history push
					if(eventName=='popstate' && new Date().getTime()-initEpoch<500) //if requested on  then ignore event
						return;
					var event=new IteEvent(e,prv.helper);
					if(systemHandle)
						event.setSystemHandle(true);

					var result=false;
					var error=undefined;
					try{
						result=callback.call(component,event);

					}catch(e){
						error=e;
					}

					if(result || !event.isSystemHandle()){
						e.preventDefault();
					}

					if(!event.isPropagation()){
						e.stopPropagation();
					}

					if(error)
						throw error;

				});
			}
			else if(element.attachEvent){

				if(eventName=='DOMSubtreeModified'){ //emulate event
					var currentData='';
					var observerCallback=function(){
						if(component.getHtml()!=currentData){
							currentData=component.getHtml();
							var event=new IteEvent(null,prv.helper);
							if(systemHandle)
								event.setSystemHandle(true);
							var error=undefined;
							try{
								callback.call(component,event);
							}catch(e){
								error=e;
							}

							if(error)
								throw error;
							;
						}
						setTimeout(observerCallback,500);
					};
					observerCallback();

					
				}
				else{
					if(eventName=='change') //FIXBUG IE
						eventName='propertychange';

					element.attachEvent("on"+eventName, function(e){
						var event=new IteEvent(e,prv.helper);
						if(systemHandle)
							event.setSystemHandle(true);
						var result=false;
						var error=undefined;
						try{
							result=callback.call(component,event);
						}catch(e){
							error=e;
						}

						if(result || !event.isSystemHandle()){
							e.returnValue=false;
						}

						if(!event.isPropagation()){
							e.stopPropagation();
						}

						if(error)
							throw error;
					});					
				}

			}
			else{
				throw new NotSupportedException();
			}
		};
	}

	pub.addEventHashChange=prv.helper.addEvent(this,'hashchange');

	pub.addEventClick=prv.helper.addEvent(this,'click');

	pub.addEventPopState=prv.helper.addEvent(this,'popstate');

	pub.addEventMouseMove=prv.helper.addEvent(this,'mousemove',true);

	pub.addEventRightClick=prv.helper.addEvent(this,'contextmenu');

})();

function IteClipboard(){
	var pub=this;
	var prv={};

	pub.set=function(value){
		var range = document.createRange();
		var tmp=Ite.createObject('<div></div>');
		Ite.get('body').append(tmp);
		tmp.setText(value);
		tmp.select();
		document.execCommand('copy');
		tmp.remove();
	};

}
function IteTryCatch(callback){
	var pub=this;
	var prv={};
	prv.error;
	prv.init=function(callback){

		try{
			callback.call();
		}catch(e){
			prv.error=e;
		}
	};

	pub.catch=function(exception,callback,next){
		next=next||false;
		if(prv.error){

			if(prv.error instanceof exception || exception instanceof Exception){
				callback.call(null,prv.error);
				prv.error=null;
			}
			else if(!next){
				throw prv.error;
			}

		}
		return pub;

	};


	prv.init(callback);
};

function IteCollection(idField){
	var pub=this;
	var prv={};
	prv.elements=new IteArray();
	prv.indexElements={};
	prv.metaData={};

	prv.events=new IteArray();
	prv.idField;
	prv.sortField=[];
	prv.provider;

	pub.setProvider=function(provider){
		prv.provider=provider;
	};

	pub.refresh=function(){
		if(!prv.provider){
			throw new ProviderNotFoundException();
		}

		prv.provider.execute(prv.metaData,pub.pushAll);
	};

	pub.setMetaData=function(name,value){
		prv.metaData[name]=value;
	};

	pub.getMetaData=function(name){
		return prv.metaData[name];
	};

	pub.push=function(record){
		if(prv.indexElements[record[prv.idField]]!=undefined){
			return; //if records exists then ignore request
		}
		prv.elements.push(record);
		prv.indexElements[record[prv.idField]]=prv.elements.length()-1;

		// var index=0; //TODO dodawanie z uwzględnieniem sortowania

		// for(var i=0; i<prv.elements.length(); i++){
		// 	var val1=prv.elements[i][prv.sortField[0]];
		// 	var val2=record[prv.sortField[0]];
		// 	if(prv.sortField[1]=='DESC' && val1<val2 || prv.sortField[1]=='ASC' && val1>val2){
		// 		index=i;
		// 		break;
		// 	}
					
		// }

		// for(;prv.elements.length(); index++){
		// 	prv.elements.update(index,)
		// }

			// prv.sortField[1]=(prv.sortField[1]=='ASC'?'DESC':'ASC');

		prv.events.each(function(callback){
			callback.call(null);
		});
	};

	pub.pushAll=function(records){
		prv.elements=new IteArray();
		new IteArray(records).each(function(record){
			prv.elements.push(record);
			prv.indexElements[record[prv.idField]]=prv.elements.length()-1;
		});

		// var index=0; //TODO dodawanie z uwzględnieniem sortowania

		// for(var i=0; i<prv.elements.length(); i++){
		// 	var val1=prv.elements[i][prv.sortField[0]];
		// 	var val2=record[prv.sortField[0]];
		// 	if(prv.sortField[1]=='DESC' && val1<val2 || prv.sortField[1]=='ASC' && val1>val2){
		// 		index=i;
		// 		break;
		// 	}
					
		// }

		// for(;prv.elements.length(); index++){
		// 	prv.elements.update(index,)
		// }

			// prv.sortField[1]=(prv.sortField[1]=='ASC'?'DESC':'ASC');

		prv.events.each(function(callback){
			callback.call(null);
		});
	};

	pub.update=function(record){
		var index=prv.indexElements[record[prv.idField]];
		if(index==undefined){
			throw new RecordNotFoundException(record[prv.idField]);
		}
		var oldData=prv.elements[index];
		var requiredSort=false;
		for(var i in record){
			oldData[i]=record[i];
			if(i==prv.sortField[0])
				requiredSort=true;
		}

		prv.elements[index]=oldData;


		for(var i=0; i<prv.elements.length(); i++){
			for(var j=i; j<prv.elements.length(); j++){
				var val1=prv.elements[i][prv.sortField[0]];
				var val2=prv.elements[j][prv.sortField[0]];
				if(prv.sortField[1]=='DESC' && val1<val2 || prv.sortField[1]=='ASC' && val1>val2){
					tmp=prv.elements[i];
					prv.elements.update(i,prv.elements[j]);
					prv.elements.update(j,tmp);
					prv.indexElements[prv.elements[j][prv.idField]]=j;
					prv.indexElements[prv.elements[i][prv.idField]]=i;
				}
			}
		}

		prv.events.each(function(callback){
			callback.call(null);
		});

		//
	}

	pub.each=function(callback){
		return prv.elements.each(function(item){
			var result=callback.call(null,item,item[prv.idField]);
			if(result)
				return result;

		});
	}

	pub.length=function(){
		return prv.elements.length();
	}

	pub.remove=function(id){
		var index=prv.indexElements[id];
		if(index==undefined){
			return;
		}
		
		prv.elements.remove(index);
		prv.indexElements={};
		//reindex
		for(var i=0; i<prv.elements.length();i++){
			var id=prv.elements[i][prv.idField];
			prv.indexElements[id]=i;
		}

		prv.events.each(function(callback){
			callback.call(null);
		});
	}

	pub.get=function(id){
		var index=prv.indexElements[id];
		return prv.elements[index];
	};

	pub.exists=function(id){
		return prv.indexElements[id]!=undefined;
	};

	pub.getAll= function () {
		return prv.elements;
	};

	pub.clear=function(){
		prv.elements=new IteArray();
		prv.indexElements={};
		prv.events.each(function(callback){
			callback.call(null);
		});
	}

	pub.sort=function(field){
		if(prv.sortField[0]==field){
			prv.sortField[1]=(prv.sortField[1]=='ASC'?'DESC':'ASC');
			//SIMPLE sort
			prv.indexElements={};
			prv.elements.reverse();
			prv.elements.each(function(item,i){
				prv.indexElements[item[prv.idField]]=i;
			});
		}
		else{

			prv.sortField=[field,'DESC'];
			var tmp;
			for(var i=0; i<prv.elements.length(); i++){
				for(var j=i; j<prv.elements.length(); j++){
					var val1=prv.elements[i][prv.sortField[0]];
					var val2=prv.elements[j][prv.sortField[0]];
					if(prv.sortField[1]=='DESC' && val1<val2 || prv.sortField[1]=='ASC' && val1>val2){
						tmp=prv.elements[i];
						prv.elements.update(i,prv.elements[j]);
						prv.elements.update(j,tmp);
						prv.indexElements[prv.elements[j][prv.idField]]=j;
						prv.indexElements[prv.elements[i][prv.idField]]=i;
					}
				}
			}
		}

		prv.events.each(function(callback){
			callback.call(null);
		});

	}

	pub.addEventChange=function(callback){
		prv.events.push(callback);
	}

	pub.clearEventChange=function(){
		prv.events.clear();
	};

	pub.toString=function(){
		return prv.elements;
	}

	prv.idField=idField||'id';
	prv.sortField=[prv.idField,'ASC'];
}

function IteConfig(){
	var prv={};
	var pub=this;

	prv.route=new IteConfigRoute();
	pub.getRoute=function(){
		return prv.route;
	}
}

function IteStorage(){
	var prv={};
	var pub=this;
	prv.localStorage=window.localStorage;
	prv.sessionStorage=window.sessionStorage;
	pub.set=function(name,value,onlySession){
		if(onlySession)
			prv.sessionStorage.setItem(name,value);
		else
			prv.localStorage.setItem(name,value);

	}

	pub.get=function(name){
		var value=prv.sessionStorage.getItem(name);
		if(value)
			return value;
		else
			return prv.localStorage.getItem(name);
	}

	pub.remove=function(name){
		prv.localStorage.removeItem(name);
		prv.sessionStorage.removeItem(name);
	}
}

function IteLogger(){
	var pub=this;
	var prv={};
	prv.level=0;

	pub.debug=function(){
		if(prv.level>=3){
			console.log.apply(console,arguments);
		}
	};

	pub.info=function(){
		if(prv.level>=2){
			console.info.apply(console,arguments);
		}
	};

	pub.warning=function(){
		if(prv.level>=1){
			console.error.apply(console,arguments);
		}
	};

	pub.setLevel=function(level){
		prv.level=level;
	};

}

function IteEvent(e,helper){
	var pub=this;
	var prv={};
	prv.helper=helper;

	prv.origin=e;
	prv.systemHandle=false;
	prv.propagation=true;
	pub.setSystemHandle=function(flag){
		prv.systemHandle=flag;
	}

	pub.isSystemHandle=function(){
		return prv.systemHandle;
	}

	pub.setPropagation=function(flag){
		prv.propagation=flag;
	}

	pub.isPropagation=function(){
		return prv.propagation;
	}

	pub.getOrigin=function(){
		return prv.origin;
	}

	pub.getTarget=function(){
		return prv.helper.getObject(pub.getOrigin().target);
	}

}

function IteConfigRoute(){
	var prv={};
	var pub=this;

	prv.rules={};

	pub.addRule=function(pattern,controller,template){
		prv.rules[pattern]=[controller,template];

	}

	pub.getRules=function(){
		return prv.rules;
	}
}

function IteArray(data){
	var pub=this;
	var prv={};
	prv.elements=[];
	prv.maxIndex=0;

	pub.push=function(element){
		prv.elements.push(element);
		pub[prv.maxIndex++]=element;
	}

	pub.update=function(index,element){
		prv.elements[index]=element;
		pub[index]=element;
	}

	pub.each=function(callback){
		var elements=prv.elements;
		for(var i=0; i < elements.length; i++){
			var result=callback.call(elements[i],elements[i],i);
			if(result!=undefined)
				return result;
		}
	}

	pub.contains=function(value){
		if(prv.elements.indexOf!=undefined){
			if(prv.elements.indexOf(value)>=0)
				return true;
			else
				return false;
		}
		else{
			for(var i=0; i < prv.elements.length; i++){
				if(prv.elements[i]==value)
					return true;
			}
			return false;
		}
	}

	pub.getFirst=function(){
		if(prv.elements.length>0)
			return prv.elements[0];
		else
			throw new ObjectIsEmptyException();
	}

	pub.getLast=function(){
		if(prv.elements.length>0)
			return prv.elements[prv.elements.length-1];
		else
			throw new ObjectIsEmptyException();
	}

	pub.get=function(index){
		var data=prv.elements[index];
		if(data)
			return data;
		else
			throw new ObjectIsEmptyException();
	}

	pub.length=function(){
		return prv.elements.length;
	}

	pub.remove=function(index){
		delete pub[index];
		for(var i=index; i<prv.elements.length-1; i++){
			pub[i]=prv.elements[i+1];
		}
		delete pub[prv.elements.length-1];

		prv.elements.splice(index,1);
		prv.maxIndex--;
	};

	pub.clear=function(){
		for(var i=0; i<prv.elements.length; i++){
			delete pub[i];
		}
		prv.elements=[];
		prv.maxIndex=0;
	};

	pub.reverse=function(){
		var sortedElements=[];
		prv.maxIndex=0;
		for(var i=pub.length()-1; i>=0; i--){
			sortedElements.push(prv.elements[i]);
			pub[prv.maxIndex++]=prv.elements[i];
		}

		prv.elements=sortedElements;

	}

	//construct
	if(data!=undefined){
		if(data instanceof IteArray){
			data.each(function(item){
				pub.push(item);
			});
		}
		else{
			for(var i=0; i < data.length; i++){
				pub.push(data[i]);
			}
		}

	}

	pub.toString=function(){
		return prv.elements;
	}


}

function IteValidatorManager(helper){
	var pub=this;
	var prv={};
	prv.helper=helper;
	prv.helper.validator={
		'defaultRules':{}
		,'fieldListener':function(){}
		,'formListener':function(){}
	};

	pub.addRule=function(name,callback){
		prv.helper.validator.defaultRules[name]=callback;
	}

	pub.setFieldListener=function(callback){
		prv.helper.validator.fieldListener=callback;
	}

	pub.setFormListener=function(callback){
		prv.helper.validator.formListener=callback;
	}

}

function IteValidator(form){
	var pub=this;
	var prv={};
	prv.rules={};
	prv.values={};
	prv.isEnable=false;
	prv.form=form;
	
	prv.fieldListener=function(){};
	prv.formListener=function(){};

	prv.formValid=undefined;

	pub.setFieldListener=function(listener){
		prv.fieldListener=listener;
	}

	pub.setFormListener=function(listener){
		prv.formListener=listener;
	}

	pub.setEnable=function(flag){
		prv.isEnable=flag;

		if(prv.isEnable){//FIXME dorobić wyłączanie walidacji czyli wyzerować wszystko
			prv.form.setAttribute('novalidate',true);

			var countNodes=0;
			prv.form.getAll('input','select','textarea').each(function(value){
				countNodes++;
				if(value.getName()!=''){
					prv.setFieldValidator(value);
				}
			});

			prv.form.addEventDOMModified(function(){
				var currentCount=prv.form.getAll('input').length();
				if(currentCount!=countNodes){
					countNodes=currentCount;
					var fields=new IteArray();
					prv.form.getAll('input','select','textarea').each(function(value){
						var fieldName=value.getName();
						if(fieldName!='' && !pub.isRule(value.getName()) && value.getType()!='button' && value.getType()!='submit'){
							prv.setFieldValidator(value);	
						}
						fields.push(value.getName());
					});
					prv.reload(fields);
				}
			});
		}

	}

	pub.addRule=function(name,callback){
		prv.rules[name]=callback;
		if(prv.form!=undefined){
			var field=prv.form.get("[name='"+name+"']");
			prv.setFieldEvent(field);
			var correct=callback(field.getValue());
			prv.values[name]=correct;

			prv.fieldListener(field,correct);
			var formValid=pub.isValid();
			if(formValid!=prv.formValid){
				prv.formValid=formValid;
				prv.formListener(pub.isValid());

			}

		}
	}

	pub.isRule=function(name){
		return prv.rules[name]!=undefined;
	}

	prv.getFieldListener=function(){
		return prv.fieldListener;
	}

	prv.getFormListener=function(){
		return prv.formListener;
	}

	prv.setFieldCorrect=function(name,correct){
		var value=prv.values[name];
		prv.values[name]=correct;

		return value!=correct;
	}

	pub.isValid=function(){
		for(var name in prv.values){
			if(!prv.values[name]){
				return false;

			}
		}

		return true;
	}

	pub.checkFieldsValid=function(){
		prv.form.getAll('input','select','textarea').each(function(field){
			var fieldName=field.getName();
			var rule=prv.rules[fieldName];
			if(rule!=undefined){
				var correct=((field.isDisabled() || !field.isRequired() && field.getValue()=='')?true:rule(field.getValue()));
				prv.setFieldCorrect(fieldName,correct);
				prv.fieldListener(field,prv.values[fieldName]);
			}
		});

		prv.formListener(pub.isValid());
	}

	prv.setFieldEvent=function(field){
		var fieldName=field.getName();
		prv.values[fieldName]=false;

		var funcCheck=function(e){
			setTimeout(function(){
				var value=field.getValue();
				var validateCallback=prv.getRule(fieldName);

				var correct=((field.isDisabled() || !field.isRequired() && value=='' || !validateCallback)?true:validateCallback(value));
				var validatorFieldListener=prv.getFieldListener();
				var currentValid;
				if(prv.setFieldCorrect(fieldName,correct)){
					validatorFieldListener(field,correct);

					currentValid=pub.isValid();
					if(prv.formValid!=currentValid){
						prv.formValid=currentValid;
						prv.formListener(prv.formValid);
					}
				}

			},1);
		};
		switch(field.getType()){
			case 'checkbox':
			case 'select':
			case 'file':
				field.addEventChange(funcCheck);
			break;
			case 'submit':
			case 'button':
			break;
			default:
				field.addEventKeyDown(funcCheck);
				field.addEventBlur(funcCheck);

		}


	}

	prv.setFieldValidator=function(field){
		var fieldName=field.getName();

		if(!pub.isRule(fieldName)){
			switch(field.getType()){
				case 'email':
					pub.addRule(fieldName,function(value){
						if(/^[^@]+@[^@]+$/.exec(value)){
							return true;
						}
						else{
							return false;
						}
					});
				break;
				case 'number':
					pub.addRule(fieldName,function(value){
						var pattern=null;
						try{
							pattern=field.getPattern();
						}
						catch(e){
							//ignore;
						}

						if(pattern!=null){
							if((field.isRequired() && value!='' || !field.isRequired()) && (new RegExp(pattern).exec(value)))
								return true;
							else
								return false;
		
						}
						else{
							var min=field.getMin();
							if(/^(|-)[0-9]+(\.[0-9]+){0,1}$/.exec(value) && (min==null || value>=min)){
								return true;
							}
							else{
								return false;
							}

						}
					});
				break;
				case 'date':
					pub.addRule(fieldName,function(value){
						if(new Date(value)!='Invalid Date'){
							return true;
						}
						else{
							return false;
						}
					});
				break;
				case 'radio':
					pub.addRule(fieldName,function(value){
						if(!field.isRequired() || field.isRequired() && field.getValue()){
							return true;
						}
						else{
							return false;
						}
					});
				break;
				case 'checkbox':
					pub.addRule(fieldName,function(value){
						if(!field.isRequired() || field.isRequired() && field.isChecked()){
							return true;
						}
						else{
							return false;
						}
					});
				break;
				case 'file':
					pub.addRule(fieldName,function(value){
						if(!field.isRequired() || field.isRequired() && field.getValue().length()>0){
							return true;
						}
						else{
							return false;
						}
					});
				break;
				case 'submit':
				case 'button':
				case 'hidden':
				break;
				default:
					var pattern=null;
					try{
						pattern=field.getPattern();
					}
					catch(e){
						//ignore;
					}
					pub.addRule(fieldName,function(value){
						if((field.isRequired() && value!='' || !field.isRequired()) && (pattern==null||new RegExp(pattern).exec(value)))
							return true;
						else
							return false;
					});
				break;

			}

		}

	}

	prv.reload=function(fields){
		for(var i in prv.rules){
			if(!fields.contains(i)){
				delete prv.rules[i];
				delete prv.values[i];
			}
		}

	}

	prv.getRule=function(name){
		return prv.rules[name];
	}


}

function Exception(e){
	var prv={};
	var pub=this;
	prv.message=e;

	pub.toString=function(){
		return prv.message;
	}

}

function RecordNotFoundException(recordId){
	var prv={};
	prv.message='Record "'+recordId+"' not found.";
	var pub=this;

	pub.toString=function(){
		return prv.message;
	}

};

function RequireArgumentException(argument){
	var prv={};
	prv.message='Require argument "'+argument+"' value.";
	var pub=this;

	pub.toString=function(){
		return prv.message;
	}

};

function InvalidArgumentValueException(argument,values){
	var prv={};
	var pub=this;
	prv.message='Invalid argument "'+argument+'" value: '+values+'.';

	pub.toString=function(){
		return prv.message;
	}
};

function AttributeNotFoundException(name){
	var prv={};
	var pub=this;
	prv.message='Attribute "'+name+'" not found.';
	this.toString=function(){
		return prv.message;
	};
};

function ObjectNotFoundException(pattern){
	var prv={};
	var pub=this;
	prv.message='Object not found for pattern "'+pattern+'".';

	pub.toString=function(){
		return prv.message;
	}
};

function ValidatorNotFoundException(){
	var prv={};
	var pub=this;
	prv.message='Validator not found.';

	pub.toString=function(){
		return prv.message;
	}

};

function InvalidHtmlStructureException(){
	var prv={};
	var pub=this;
	prv.message='Invalid html structure.';

	pub.toString=function(){
		return prv.message;
	}

};

function ObjectIsEmptyException(){
	var prv={};
	var pub=this;
	prv.message='Object is empty.';

	pub.toString=function(){
		return prv.message;
	}

};

function NotSupportedException(){
	var prv={};
	var pub=this;
	prv.message='Not supported.';

	pub.toString=function(){
		return prv.message;
	}

};

function ProviderNotFoundException(){
	var prv={};
	var pub=this;
	prv.message='Provider not found.';

	pub.toString=function(){
		return prv.message;
	}

};
