Ite.registerModule('loadMask',function(unsecureContent,secureContent){
	"use strict";
	var prv={};
	var pub=this;
	pub.show=function(){
		Ite.setCursor('wait');
		Ite.get('.loader-wrap').removeClass('hide');
		// Ite.get('.content').getDOMElement().style.opacity=0;
	}

	pub.hide=function(){
		Ite.setCursor('auto');
		Ite.get('.loader-wrap').addClass('hide');
		// Ite.get('.content').getDOMElement().style.opacity=1;

		Ite.setScrollPosition(0,0);
	}

});