"use strict";
Ite.registerModule('time',function(){
	var prv={};
	var pub=this;

	pub.timeToInterval=function(epoch){ //TODO przenieść do osobnego modułu
		var hour=Math.floor(epoch/1000/60/60);
		var minute=Math.floor((epoch/1000/60)-(hour*60));
		var seconds=Math.floor((epoch/1000)-(hour*60*60+minute*60));

		return (hour<10?'0':'')+hour+":"+(minute<10?'0':'')+minute+":"+(seconds<10?'0':'')+seconds;
	};

});