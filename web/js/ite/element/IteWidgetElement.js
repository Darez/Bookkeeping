Ite.registerElement('IteWidgetElement','.widget',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;
	prv.collection;
	prv.helper=helper;
	prv.valueField='id';
	prv.labelField='name';
	prv.visible=true;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	prv.init=function(){

		Ite.try(function(){
			var header=pub.get('header');

			header.addEventClick(function(){
				if(prv.visible){
					pub.get('.body').setDisplay('none');
				}
				else{
					pub.get('.body').setDisplay('block');				
				}

				prv.visible=!prv.visible;
			});

		}).catch(ObjectNotFoundException, function(e){
			//ignore
		});

	};

	prv.init();
});