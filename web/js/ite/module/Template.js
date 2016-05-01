Ite.registerModule('template',function(){
	"use strict";
	var prv={};
	var pub=this;

	prv.init=function(){
	};

	pub.get=function(id,args){
		args=args||{};
		var template=Ite.get('[type="text/template"]#'+id).getHtml().trim();
		for(var key in args){
			template=template.replace(new RegExp("\\$\{"+key+"\}"),args[key]);

		}
		return template;
	};

	prv.init();

});