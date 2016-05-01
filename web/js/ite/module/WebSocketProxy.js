function WebSocketProxy(url, callback, onCloseCallback){
	"use strict";
	var prv={};
	var pub=this;
	prv.connected = false;
	prv.socket = null;
	prv.sendWait = null;
	prv.sendCallbacks = [];
	prv.executeIndex = 0;
	prv.eventFilters = {};
	prv.argumentsFilters=[];

	prv.eventFiltersJSON = {};
	prv.eventFiltersSendCallback = {};
	prv.eventIndex=0;
	prv.eventIndexes={};

	
	prv.onCloseCallback = null;
	prv.pingHandler=null;
	prv.currentIndex=0;
	prv.eventCount={};
	prv.init=function(){
		try{
			prv.url = url;
			prv.onCloseCallback = onCloseCallback;
			prv.connect(callback);
		} catch(exception){
			setTimeout(function(){ prv.connect(callback); }, 10000);
		}

	}

	pub.isConnected=function(){
		return prv.connected;
	}

	prv.ping=function(){
		clearTimeout(prv.pingHandler);
		prv.pingHandler=setTimeout(function(){
			pub.send('ping',{});
		},300000);
	};

	prv.connect = function(callback){
		if(!prv.url || prv.connected) {
			return;
		}

		prv.executeIndex = 0;
		prv.sendCallbacks = [];
		if(prv.socket){
			delete prv.socket;
		}
		prv.socket = new WebSocket(prv.url);

		prv.socket.onopen = function(){
			prv.connected = true;
			callback(pub);

		};

		prv.socket.onmessage = function(msg){
			if(msg.data == '') {
				return;
			}

			prv.ping();
			Ite.logger().debug("RESPONNSE",msg.data);

			var jsonData=JSON.parse(msg.data);
			if (jsonData.type == "answer"){
				if(jsonData.code==0){
					if(prv.sendCallbacks[prv.executeIndex][0] != null){
						prv.sendCallbacks[prv.executeIndex++][0](jsonData.data,new Date().getTime());
					}
				}
				else if(prv.sendCallbacks[prv.executeIndex][1] != null){
					prv.sendCallbacks[prv.executeIndex++][1](jsonData.code,jsonData.message);

				}
			}else if(jsonData.type == "event"){
				if (prv.eventFilters[jsonData.index] != null){
					if(jsonData.count!=prv.eventCount[jsonData.index]++){
						Ite.logger().warning('Lost event for filter '+jsonData.index+'. Count '+prv.eventCount[jsonData.index]);
					}
					for (var i in prv.eventFilters[jsonData.index]) {
						prv.eventFilters[jsonData.index][i](jsonData.name, jsonData.data,jsonData.time);
					}
				}
			}
		}

		prv.socket.onclose = function(msg){
			prv.connected = false;
			prv.onCloseCallback(msg.data);
			Ite.logger().info('socket closed or socket not found. reconnect in 10 seconds');
			//kill all request
			for(var i=prv.executeIndex; i <prv.sendCallbacks.length; i++){
				prv.sendCallbacks[i][1](1,'Serwer nie odpowiada!');
			}

			setTimeout(function(){ prv.connect(callback); }, 10000);
		}

	}

	pub.disconnect = function(callback){
		this.url = false;
		if(prv.socket) {
			prv.socket.close();
		}
		delete prv.socket;
		prv.socket = false;
	}

	pub.send = function(method,args, success,fail){
		success=success||function(){};
		fail=fail||function(){}

		if(pub.isConnected()){
			var data={'action':method,'arguments':args};
			Ite.logger().debug('SEND::'+data.action,data.arguments);
			var stringData=prv.encodeChars(JSON.stringify(data));
			
			prv.socket.send(stringData);
			var index = prv.sendCallbacks.length;
			prv.sendCallbacks[index] = [success,fail];
		}else{
			Ite.logger().info('waiting for socket "' + prv.connected+'" with data:',data);
			var handle = this;

			//killowanie nadmiarowych sendów
			if (prv.sendWait != null)
				clearTimeout(handle.sendWait);

			//oczekujemy na połączenie z socketem
			prv.sendWait = setTimeout(function(){pub.send(method,args, success,fail);}, 1000);
		}
	}

	prv.encodeChars=function(string){
		var characters=['ą','Ą','ć','Ć','ę','Ę','ń','Ń','ł','Ł','ś','Ś','ó','Ó','ź','Ź','ż','Ż'];
		for(var i=0; i<characters.length; i++){
			var reg=new RegExp(characters[i],'g');
			string=string.replace(reg,"u'"+characters[i].charCodeAt(0)+';');
		}

		return string;
	};

	pub.bind = function(events,args, callback){
		var filter={name:events,arguments:args};
		Ite.logger().info("BIND",index,callback);
		var index=prv.checkForExistingFilter(JSON.stringify(filter));
		var subindex=0;

		if(index<0){
			index=prv.eventIndex++;
			prv.argumentsFilters[index]=[JSON.stringify(filter),index];
			prv.eventIndexes[index]=0;
			filter.index=index;
			prv.eventFilters[index]={};
			subindex=prv.eventIndexes[index]++
			pub.send('event/bind',filter,function(data){
				prv.eventCount[filter.index]=1;
				prv.eventFilters[filter.index][subindex]=callback;
			});

		}
		else{
			subindex=prv.eventIndexes[index]++
			prv.eventFilters[index][subindex]=callback;
		}

		return index+'_'+subindex;

	};

	pub.unbind = function(id){
		var idParts=id.split('_');

		delete prv.eventFilters[idParts[0]][idParts[1]];

		if (Object.keys(prv.eventFilters[idParts[0]]).length == 0){
			delete prv.argumentsFilters[idParts[0]];
			delete prv.eventFilters[idParts[0]];
			pub.send('event/unbind',{index:idParts[0]},function(data){
				delete prv.eventCount[idParts[0]];
			});
		}
	}

	prv.checkForExistingFilter = function (filter){

		for(var i in prv.argumentsFilters){
			if(prv.argumentsFilters[i][0]==filter){
				return prv.argumentsFilters[i][1];
			}
		}

		return -1;
	}

	prv.init();
}
