function FilterProvider(contener,url){
	"use strict";
	var prv={};
	var pub=this;

	pub.execute=function(args,callback){
		Ite.api().execute(contener,url,args,function(data){
			data.unshift({'id':'','name':'Wybierz...'});
			callback.call(null,data);
		});
	};

};