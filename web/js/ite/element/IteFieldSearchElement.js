Ite.registerElement('IteFieldSearchElement','[data-type="search"]',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteFieldElement',htmlElement,prv.scope);

	prv.requireReload=false;
	prv.listContener;
	prv.ignoreChange=false;
	prv.enable=true;
	prv.labelCallback=null;
	prv.storage=null;
	prv.callback=null;
	prv.notResultCallback=null;
	prv.beforeRenderCallback=function(){};
	prv.arguments={};
	prv.cursor=0;
	prv.delayTime=600;

	prv.result=new IteArray();

	pub.setStorage=function(storage){
		if(typeof storage =="string"){
			var storageName=storage;
			storage=function(arg,success,fail){
				Ite.ajax().execute(storageName,Ite.ajax().POST,prv.arguments,true,success,fail);
			};
		}
		prv.storage=storage;
	}

	pub.setRecordFormatter=function(formatter){
		prv.labelCallback=formatter;
	}

	pub.addEventSelectedRecord=function(callback){
		prv.callback=callback;
	}

	pub.addEventNoRecords=function(callback){
		prv.notResultCallback=callback;
	}

	pub.addEventBeforeRender=function(callback){
		prv.beforeRenderCallback=callback;
	}

	pub.setExtraStorageArguments=function(args){
		prv.arguments=args;
	}

	pub.addResultItem=function(label,callback,data){
		prv.result.push({label:label,callback:callback,data:data});
	}

	pub.setDelayTime=function(miliseconds){
		prv.delayTime=miliseconds;
	}

	prv.init=function(){
		prv.field=pub;

		prv.createComponents();

		var currentLabel=prv.field.getValue();

		var delayExecute=null;
		prv.field.addEventKeyDown(function(e){

			prv.ignoreChange=true;
			var event=e.getOrigin();
			if(event.keyCode==13){//enter
				if(delayExecute)
					clearTimeout(delayExecute);

				if(prv.pressEnter()){
					currentLabel=prv.field.getValue();
					e.setSystemHandle(false);

				}
			}
			else if(event.keyCode==40)
				prv.moveCursor(1);
			else if(event.keyCode==38)
				prv.moveCursor(-1);
			else{
				if(delayExecute)
					clearTimeout(delayExecute);

				delayExecute=setTimeout(function(){
					if(prv.field.getValue()!=currentLabel){
						prv.execute();
						currentLabel=prv.field.getValue();
					}

				},prv.delayTime);

			}

		});

		prv.field.addEventBlur(function(e){

			currentLabel=prv.field.getValue();
			prv.listContener.setDisplay('none');
		});

		pub.setRecordFormatter(function(data){
			var result=[];
			for(var key in data){
				result.push(data[key]);
			}

			return result.join(' ');
		});

	}

	prv.moveCursor=function(vector){
		var records=prv.listContener.getAll('.auto-complete-row');
		prv.cursor+=vector;
		if(prv.cursor>=records.length())
			prv.cursor=0;
		else if(prv.cursor<0)
			prv.cursor=records.length()-1;

		try{
			prv.listContener.get('.auto-complete-row-enable').removeClass('auto-complete-row-enable');
		}
		catch(e){
			//ignore
		}

		records[prv.cursor].addClass('auto-complete-row-enable');

	}

	prv.createComponents=function(){
		prv.listContener=Ite.createObject('<div class="auto-complete-list-contener"></div>');
		prv.listContener.setWidth(prv.field.getWidth());
		prv.listContener.setDisplay('none');

		Ite.get('body').append(prv.listContener);

	}


	prv.pressEnter=function(){
		if(prv.listContener.getDisplay()=='block'){
			try{
				var record=prv.result[prv.cursor];
				record.callback.call(pub,record.data);
				prv.listContener.setDisplay('none');
				return true;
			}
			catch(e){
				//skipp
			}
		}
	}

	prv.execute=function(){

		if(!prv.isProces){
			var phrase=prv.field.getValue();
			if(phrase==''){
				prv.listContener.setDisplay('none');
			}
			else{
				prv.requireReload=false;
				prv.isProces=true;
				prv.showLoadingLabel();
				prv.arguments['phrase']=prv.field.getValue();

				prv.storage.call(null,prv.arguments,function(data){
					prv.isProces=false;
					if(prv.enable && prv.field.isFocus()){

						prv.result=new IteArray();
						for(var i=0; i<data.length; i++){
							prv.result.push({label: prv.labelCallback(data[i]),callback:prv.callback,data:data[i]});
						}
						prv.buildList();

						if(prv.requireReload)
							prv.execute();

					}

				},function(code,data){
					prv.isProces=false;

				});
			}
		}
		else
			prv.requireReload=true;


	}


	prv.showLoadingLabel=function(){
		prv.listContener.setText('Proszę czekać...');
		prv.render(true);
	}


	prv.buildList=function(){
		prv.listContener.setHtml('');
		var showListContener=false;

		if(prv.result.length()==0 && prv.notResultCallback){
			prv.notResultCallback.call(pub);
		}

		prv.beforeRenderCallback.call(pub);

		for(var i=0 ; i < prv.result.length(); i++){
			var row=Ite.createObject('<div class="auto-complete-row">'+prv.result[i].label+'</div>');
			(function(i){
				row.addEventMouseDown(function(e){
					prv.result[i].callback.call(pub,prv.result[i].data);
					prv.listContener.setDisplay('none');
				});

			}(i));

			prv.listContener.append(row);

			if(i==0)
				row.addClass('auto-complete-row-enable');
		}

		showListContener=true;

		prv.cursor=0;

		prv.render(showListContener);
	}

	prv.render=function(showListContener){
		if(!showListContener)
			prv.listContener.setDisplay('none');
		else if(prv.listContener.getDisplay()!='block'){
			prv.listContener.setPositionX(prv.field.getOffsetX());
			prv.listContener.setPositionY(prv.field.getOffsetY()+prv.field.getHeight());
			prv.listContener.setWidth(prv.field.getWidth());
			prv.listContener.setDisplay('block');

		}

	}

	pub.setEnable=function(flag){
		prv.enable=flag;
	}

	prv.init();
});