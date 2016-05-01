Ite.registerElement('IteFieldSelectElement','select',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;
	prv.collection;
	prv.helper=helper;
	prv.valueField='id';
	prv.labelField='name';
	prv.data;

	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteFieldElement',htmlElement,prv.scope);


	pub.setCollection=function(collection){
		if(prv.collection){
			//add remove element listener
		}

		prv.collection=collection;
		prv.collection.addEventChange(prv.refresh);
		prv.refresh();
	};

	pub.getCollection=function(){
		return prv.collection;

	};

	pub.setCollectionMap=function(value,label){
		prv.valueField=value;
		prv.labelField=label;
	};

	pub.setValue=function(value,silent){
		prv.component.select2('val',value);

	};

	pub.setData=function(value,silent){
		prv.data=value;
		if(pub.isMultiple()){

			pub.getAll('option').each(function(option){
				option.removeAttribute('selected');
			});

			pub.getAll('option').each(function(option){
				new IteArray(value).each(function(data){
					if(option.getAttribute('value')==data){
						option.setAttribute('selected','');
					}
				});
			});

		}
		else{
			pub.getDOMElement().value=value;
		}

		if(!silent){
			pub.fireEvent('change');
		}


	};

	prv.init=function(){
		var element=pub.getDOMElement();
        var jqElement=$(element);
        prv.component=jqElement;
        var time=Date.now();
        jqElement.select2().on('change',function(){
        	if(time+100<Date.now()){//TODO jeśli jest podpięty walidator to zapętla się jakimś cudem stack
	        	time=Date.now();
	        	pub.fireEvent('change');
        	}
        });

        prv.collection=Ite.createCollection();

		pub.getAll('option').each(function(item){
	        prv.collection.push({id:item.getAttribute('value'),name:item.getText()});
		});

		prv.collection.addEventChange(prv.refresh);


	};

	prv.refresh=function(){
		pub.setHtml('');
		var template=[];
		prv.collection.each(function(record,id){
			var value=record[prv.valueField];
			var label=record[prv.labelField];
			template.push('<option value="'+value+'">'+label+'</option>');
		});
		pub.setHtml(template);
		if(prv.data){
			pub.setData(prv.data);
		}
	};

	prv.init();
});