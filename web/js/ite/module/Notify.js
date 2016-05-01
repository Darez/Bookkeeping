Ite.registerModule('notify',function(unsecureContent,secureContent){
	"use strict";
	var prv={};
	var pub=this;

	prv.activeTimer=false;
    
	pub.addInfo=function(message){
		prv.addMessage('success',message);
	}

	prv.addMessage=function(className,message){

		Messenger({theme: 'air'}).post({
		    message: message,
		    type: className,
		    showCloseButton: false,
		    theme: 'air'

		});
	}

	pub.addWarning=function(message){
		prv.addMessage('alert-warning',message);

	}

	pub.addError=function(message){
		prv.addMessage('error',message);
	}

});