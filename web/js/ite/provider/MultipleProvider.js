function MultipleProvider(content,url){
	"use strict";
	var prv={};
	var pub=this;

	pub.execute=function(args,callback){
		Ite.api().execute(content,url,args,function(data){
			callback.call(null,data);
		});
	};

};