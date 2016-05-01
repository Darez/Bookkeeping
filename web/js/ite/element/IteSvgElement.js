Ite.registerElement('IteSvgElement','svg',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	prv.init=function(){

	};

	pub.getWidth=function(){
		var box = pub.getDOMElement().getBoundingClientRect();
		return box.right-box.left;
	};

	pub.getHeight=function(){
		var box = pub.getDOMElement().getBoundingClientRect();
		return box.bottom-box.top;
	};

	prv.init();

});
