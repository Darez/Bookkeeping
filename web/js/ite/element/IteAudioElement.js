Ite.registerElement('IteAudioElement','audio',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	prv.init=function(){

	};

	pub.addSource=function(url,type){
		var html=pub.getHtml();
		pub.setHtml('<source src="'+url+'" type="'+type+'"/>'+html);
	};

	pub.stop=function(){
		var player=pub.getDOMElement();
		player.pause();
		player.src='';
		player.load();
	};

	prv.init();

});
