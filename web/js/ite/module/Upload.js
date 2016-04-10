"use strict";
Ite.addElementModule('IteFieldObject','upload',function(endCallback){

	this.addEventChange(function(e){
		e.setSystemHandle(false);

		var file=this.getDOMElement().files[0];
		var reader = new FileReader();

		reader.onloadend = function () {
			endCallback.call(this,file);
		};

		reader.readAsDataURL(file);


	});
});