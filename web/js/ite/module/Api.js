Ite.registerModule('api',function(){
	"use strict";
	var prv={};
	var pub=this;
	prv.url='';
	prv.login='';
	prv.password='';
	prv.functionalities=new IteArray();
	prv.id=0;
	prv.vectorTime=0;
	prv.sessionId;
	prv.failListener=function(){};
	prv.callbackLogged=function(){};
	prv.eventConnectIndex=0;
	prv.countConnected=0;
	prv.eventConnnect={};

	prv.init=function(){
	};

	pub.connect=function(){
		prv.url=CONFIG.url;
		prv.login=CONFIG.login;
		prv.password=CONFIG.password;
		prv.id=CONFIG.id;

		prv.ws=new WebSocketProxy('ws://'+prv.url+':4039',prv.wrapCallbackConnected,prv.callbackDisconnected);
	};

	pub.getUserId=function(){
		return prv.id;
	};

	pub.getSessionId=function(){
		return prv.sessionId;
	};

	pub.addFailListener=function(callback){
		prv.failListener=callback;
	}

	pub.getServerTime=function(time){
		time=time||new Date().getTime();
		
		return time-prv.vectorTime;
	};

	pub.isAllow=function(functionality){
		return prv.functionalities.contains(functionality);
	};

	pub.setCallbackLogged=function(callback){
		prv.callbackLogged=callback;
	};

	prv.wrapCallbackConnected=function(){
		prv.countConnected++;
		Ite.get('body').removeClass('disconnected');

		prv.ws.send('login',{'login':prv.login,'password':prv.password},function(data){
			prv.vectorTime=new Date().getTime()-data.time;
			prv.functionalities=new IteArray(data.functionalities);
			prv.sessionId=data.sessionId;
			prv.callbackLogged.call(null,data)

			//set cookie
			document.cookie='jsid='+Ite.api().getSessionId()+'; path=/';

			if(prv.countConnected>1){
				for(var index in prv.eventConnnect){
					prv.eventConnnect[index].call(null);
				}
			}

		},function(code,message){
			prv.failListener.call(null);
		});
	}

	prv.callbackDisconnected=function(){
		Ite.get('body').addClass('disconnected');
	}

	pub.addEventConnect=function(callback){
		var index=prv.eventConnectIndex++;
		prv.eventConnnect[index]=callback;
		return index;
	};

	pub.removeEventConnect=function(index){
		delete prv.eventConnnect[index];
	};

	pub.bind=function(events,filters,callback,fail){
		return prv.ws.bind(events,filters,callback);
	};

	pub.unbind=function(filterId,fail){
		if(prv.ws.isConnected()){
			prv.ws.unbind(filterId);
		}
		else{
			var code=500;
			var message='Brak połączenia z serwerem.';
			var headers={};
			if(fail!=undefined){
				fail.call(null,code,message);
			}
			else{
				prv.failListener(code,message,headers);
			}
		}
	};

	pub.executeUpload=function(contener,method,file,fields,success,progress,fail){
		// Ite.loadMask().show();
		if(contener){
			var label=null;
			if(Array.isArray(contener)){
				label=contener[1];
				contener=contener[0];
			}
			contener.setLoadMask(true,label);
		}

		Ite.ajax().uploadFile('/'+method+'.json',file,fields
			,function(data){
				if(contener){
					contener.setLoadMask(false);
				}
				success.call(null,data);
			}
			,progress
			,function(code,data,headers){
				// Ite.loadMask().hide();
				if(contener){
					contener.setLoadMask(false);
				}

				if(data){
					code=data.code;
					data=data.message;
				}
				var headers={};

				if(data==undefined)
					data='Wystąpił błąd wewnętrzny.';

				if(fail!=undefined){
					fail.call(null,code,data);
				}
				else{
					prv.failListener(code,data,headers);
				}
		});


	};

	pub.executeUploadAC=function(contener,method,file,fields,success,progress,fail){
		// Ite.loadMask().show();
		if(contener){
			var label=null;
			if(Array.isArray(contener)){
				label=contener[1];
				contener=contener[0];
			}
			contener.setLoadMask(true,label);
		}

		Ite.ajax().uploadFile('http://'+prv.url+':4040/'+method+'.json',file,fields
			,function(data){
				if(contener){
					contener.setLoadMask(false);
				}
				success.call(null,data);
			}
			,progress
			,function(code,data,headers){
				// Ite.loadMask().hide();
				if(contener){
					contener.setLoadMask(false);
				}

				if(data){
					code=data.code;
					data=data.message;
				}
				var headers={};

				if(data==undefined)
					data='Wystąpił błąd wewnętrzny.';

				if(fail!=undefined){
					fail.call(null,code,data);
				}
				else{
					prv.failListener(code,data,headers);
				}
		});


	};
	pub.execute=function(contener,method,args,success,fail){
		if(contener){
			var label=null;
			console.log(typeof contener)
			if(Array.isArray(contener)){
				label=contener[1];
				contener=contener[0];
			}
			contener.setLoadMask(true,label);
		}

		fail=fail||prv.failListener;
		success=success||function(){};


		prv.ws.send(method,args,function(data){
			if(contener){
				contener.setLoadMask(false);
			}
			success.call(null,data);
		},function(code,message){
			if(contener){
				contener.setLoadMask(false);
			}
			fail.call(null,code,message);
		});

	}

	prv.init();

});