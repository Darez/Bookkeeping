Ite.registerElement('IteFieldCheckboxElement','input[type="checkbox"]',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteFieldElement',htmlElement,prv.scope);

	// pub.setChecked=function(flag){
	// 	pub.getDOMElement().checked=flag;
	// };

});