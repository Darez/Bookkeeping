Ite.route().addController('ManagmentForm',function(){
	"use strict";
	var prv={};
	var pub=this;

	pub.add=function(){

		var form=Ite.get('form');
		form.getValidator().setEnable(true);

		form.addEventSubmit(function(e){
			if(this.isValid()){
				e.setSystemHandle(true);
			}
		});

	};

	pub.addFinish=function(){
		var pdfEditor=Ite.get('[role="pdf-editor"]');
	};

});