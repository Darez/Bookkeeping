Ite.registerModule('route',function(helper){
	"use strict";
	var prv={};
	var pub=this;
	prv.helper=helper;
	prv.rules={};
	prv.controllers={};
	prv.isBind=false;
	prv.isInit=false;
	prv.cacheTemplate={};
	prv.contener;
	prv.loadTemplateFailListener=new IteArray();
	prv.changeListener=new IteArray();
	prv.changedListener=new IteArray();
	prv.cache=true;
	prv.currentController;

	pub.init=function(){
		if(!prv.isInit){
			var rules=prv.helper.config.getRoute().getRules();
			Ite.extend(prv.rules,rules);
			prv.bind();

			var url='/'+prv.getURL();

			for(var index in prv.rules){
				var rule=prv.rules[index];
				if(prv.execute(index,url,rule[0],rule[1])){
					break;
				}
			}
			prv.isInit=true;
		}

	}

	pub.setCache=function(flag){
		prv.cache=flag;
	}

	pub.addController=function(name,callback){
		prv.controllers[name]=callback;
		//TODO przeskanować wszystkie zasady i sprawdzić czy do jakiegoś nie jest już podpięty kontroler
	}

	pub.addRule=function(pattern,controller,template){

		prv.rules[pattern]=[controller,template];

		prv.bind();

		var url='/'+prv.getURL();

		prv.execute(pattern,url,controller,undefined,false);
	}

	pub.addEventChange=function(listener){
		prv.changeListener.push(listener);
	}

	pub.addEventChanged=function(listener){
		prv.changedListener.push(listener);
	}

	/**
	 * @arg url - link to destiny page
	 * @arg force - if is set on true then executed old method browser redirect (without HistoryApi).
	*/
	pub.redirect=function(url,force){
		prv.changeListener.each(function(listener){
			listener.call(null);
		});

		if(!force){
			for(var index in prv.rules){
				var rule=prv.rules[index];
				if(prv.execute(index,url,rule[0],rule[1])){
					return;
				}
			}

		}

		window.location.href=url;
	}

	pub.setContener=function(contener){
		prv.contener=Ite.get(contener);
	}

	pub.clearCache=function(){
		prv.cacheTemplate={};
	}

	pub.addEventLoadTemplateFail=function(callback){
		prv.loadTemplateFailListener.push(callback);
	}

	prv.getURL=function(){
		var url=document.URL.substring(document.URL.indexOf('/',9)+1);

		var endUrlPosition=url.indexOf("?");
		if(endUrlPosition>=0){
			url=url.substring(0,endUrlPosition);
		}
		else{
			var endUrlPosition=url.indexOf("#");
			if(endUrlPosition>=0){
				url=url.substring(0,endUrlPosition);
			}			
		}

		return url;
	}

	pub.call=function(controller,args){
		var controllerParts=controller.split('::');
		var method;
		if(controllerParts.length==2){
			controller=controllerParts[0];
			method=controllerParts[1];

		}

		if(prv.currentController && typeof prv.currentController.destruct=='function'){
			prv.currentController.destruct();
		}

		var controllerObject=new prv.controllers[controller](args);
		prv.currentController=controllerObject;
		if(typeof controllerObject.construct=='function'){
			controllerObject.construct();			
		}

		if(method){
			controllerObject[method].apply(null,args);
		}

	}

	prv.execute=function(pattern,url,action,template,pushHistory){

		if(pushHistory==undefined)
			pushHistory=true;

		var match=new RegExp(pattern).exec(url);
		if(match){
			var actionParts=action.split('::');
			var controller;
			if(actionParts.length==2){
				controller=actionParts[0];
			}

			if(prv.controllers[controller]){
				match.splice(0,1);
				if(pushHistory){
					if(window.history.pushState){
						window.history.pushState({url:url,pattern:pattern,controller:controller,template:template},null,url);
					}else{
						window.location.href=url;
					}
				}
				if(prv.contener && template){

					if(!prv.cache || !prv.cacheTemplate[url]){
						for(var i=0; i <match.length; i++){
								template=template.replace('{'+(i+1)+'}',match[i]||'');
						}
						Ite.ajax().execute(template,'GET',{},true,function(data){
							var tmpContener=Ite.createObject('<div />');
							tmpContener.setHtml(data);
							prv.contener.setHtml('');
							prv.contener.append(tmpContener);
							pub.call(action,match);

							if(prv.cache)
								prv.cacheTemplate[url]=tmpContener;//tutaj zmienic na dat

							prv.changedListener.each(function(listener){
								listener.call(null);
							});

						},function(code,data,headers){
							prv.loadTemplateFailListener.each(function(listener){
								listener.call(null,template,code,data,headers);
							});

							prv.changedListener.each(function(listener){
								listener.call(null);
							});

						});
					}
					else{

						prv.contener.setHtml('');
						prv.contener.append(prv.cacheTemplate[url]);
						// prv.controllers[controller].apply(null,match);

						prv.changedListener.each(function(listener){
							listener.call(null);
						});

					}
				}
				else{
					pub.call(action,match);

				}
		
			}

			return true;
		}

	}

	prv.bind=function(){
		if(!prv.isBind){
			var hashClick={};

			Ite.addEventClick(function(e){
				e.setSystemHandle(true);
				try{
					var href=e.getTarget().getAttribute('href');

					var target='';
					try{
						target=e.getTarget().getAttribute('target');
					}catch(err){
						//ignore
					}
					var hrefPart=href.split('#');
					href=hrefPart[0];
					
					if(href!='' && target!='_blank'){
						e.setSystemHandle(false);

						prv.changeListener.each(function(listener){
							listener.call(null);
						});

						for(var index in prv.rules){
							var rule=prv.rules[index];
							if(prv.execute(index,href,rule[0],rule[1])){
								return;
							}
						}

						window.location.href=href;
					}				


				}
				catch(e){
					//ignore is not anchor;
				}

			});

			Ite.addEventPopState(function(e){
				var state = e.getOrigin().state;
				prv.changeListener.each(function(listener){
					listener.call(null);
				});

				if(state)
					prv.execute(state.pattern,state.url,state.controller,state.template,false);
				else{

					var url='/'+prv.getURL();

					for(var index in prv.rules){
						var rule=prv.rules[index];
						if(prv.execute(index,url,rule[0],rule[1],false)){
							return;
						}
					}

					window.location.href=url;


				}
			});

			prv.isBind=true;
		}

	}

});