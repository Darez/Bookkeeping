Ite.registerElement('IteFieldAutoCompleteElement','[data-type="autocomplete"]',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteFieldElement',htmlElement,prv.scope);

	prv.requireReload=false;
	prv.storage=new IteArray();
	prv.listContener;
	prv.ignoreChange=false;
	prv.cursor=0;

	pub.init=function(){
		prv.field=this;
		prv.field.getAll('option').each(function(option){
			if(option.getAttribute('value')!='')
				prv.storage.push({id:option.getAttribute('value'),label:option.getHtml()});
		});


		prv.createComponents();

		var currentLabel=prv.textContener.getValue();

		prv.textContener.addEventKeyDown(function(e){
			prv.ignoreChange=true;
			var event=e.getOrigin();
			prv.clearValue();
			if(event.keyCode==13){//enter
				if(prv.pressEnter()){
					currentLabel=prv.textContener.getValue();
					e.setSystemHandle(false);

				}
			}
			else if(event.keyCode==40)
				prv.moveCursor(1);
			else if(event.keyCode==38)
				prv.moveCursor(-1);
			else{
				setTimeout(function(){

					if(prv.textContener.getValue()!=currentLabel){
						prv.execute();
						currentLabel=prv.textContener.getValue();
					}
					if(prv.textContener.getValue()=='' && prv.textContener.isFocus()){
						prv.buildList(prv.storage);
					}
					prv.ignoreChange=false;

				},1);

			}

		});

		prv.textContener.addEventFocus(function(e){
			if(prv.textContener.getValue()==''){
				prv.buildList(prv.storage);
			}
		});

		prv.textContener.addEventBlur(function(e){
			if(!prv.field.getValue())
				prv.textContener.setValue('');
			else{
				var record=prv.listContener.get('.auto-complete-row[data-id="'+prv.field.getValue()+'"]');
				prv.textContener.setValue(record.getHtml());
			}

			currentLabel=prv.textContener.getValue();
			prv.listContener.setDisplay('none');
		});

		prv.field.addEventChange(function(e){
			if(!prv.ignoreChange){
				var record=prv.field.get('option[value="'+prv.field.getValue()+'"]');
				if(record){
					var label=(record.getAttribute('value')==''?'':record.getHtml());

					prv.textContener.setValue(label);
					currentLabel=prv.textContener.getValue();
				}
				prv.ignoreChange=false;
			}


		});

		prv.field.addEventDOMModified(function(){
			prv.storage=new IteArray();
			prv.field.getAll('option').each(function(option){
				if(option.getAttribute('value')!='')
					prv.storage.push({id:option.getAttribute('value'),label:option.getHtml()});
			});

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
		var parent=prv.field.getParent();
		var textContener=prv.field.toHtml();
		prv.textContener=Ite.createObject('<input type="text" autocomplete="off" />');
		prv.field.getClass().each(function(className){
			prv.textContener.addClass(className);

		});

		prv.textContener.setId(prv.field.getId());
		var label='';
		var fieldValueId=prv.field.getValue();
		if(fieldValueId!=''){
			prv.field.getAll('option').each(function(option){
				if(option.getAttribute('value')==fieldValueId){
					label=option.getHtml();
					return true;
				}
			});
		}
		prv.textContener.setValue(label);
		prv.field.setId(undefined);
		prv.field.setDisplay('none');
		prv.field.getParent().append(prv.textContener,-1); //TODO dorobić metodę która pozowli wrzucić element zaraz za  fieldem


		prv.listContener=Ite.createObject('<div class="auto-complete-list-contener"></div>');
		prv.listContener.setWidth(prv.textContener.getWidth());
		prv.listContener.setDisplay('none');

		Ite.get('body').append(prv.listContener);

	}

	prv.pressEnter=function(){
		if(prv.listContener.getDisplay()=='block'){
			try{
				var record=prv.listContener.getAll('.auto-complete-row')[prv.cursor];
				prv.setValue(record.getAttribute('data-id'),record.getHtml());
				return true;
			}
			catch(e){
				//skipp
			}
		}
		// else{
		// 	prv.field.setValue('');			
		// }
	}

	prv.execute=function(){
		debugger;
		var phrase=prv.textContener.getValue();
		if(phrase==''){
			prv.listContener.setDisplay('none');
			prv.field.setValue('');			
		}
		else{
			prv.requireReload=false;
			var matches=new IteArray();
			var reg=RegExp(prv.textContener.getValue().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").toLowerCase());
			for(var i=0; i < prv.storage.length(); i++){
				var record=prv.storage[i];
				if(reg.test(record.label.toLowerCase())){
					matches.push(record);
				}
			}
			prv.buildList(matches);
		}

	}

	prv.buildList=function(data){
		var template='';
		for(var i=0 ; i < data.length(); i++){
			template+='<div class="auto-complete-row" data-id="'+data[i].id+'">'+data[i].label+'</div>'
		}

		prv.cursor=0;
		prv.listContener.setHtml(template);

		prv.listContener.getAll('.auto-complete-row').each(function(row){
			row.addEventMouseDown(function(e){
				prv.setValue(row.getAttribute('data-id'),row.getHtml())
			});
		});

		if(data.length()>0)
			prv.listContener.get('.auto-complete-row').addClass('auto-complete-row-enable');

		if(template=='')
			prv.listContener.setDisplay('none');
		else if(prv.listContener.getDisplay()!='block'){

			prv.listContener.setPositionX(prv.textContener.getOffsetX());
			prv.listContener.setPositionY(prv.textContener.getOffsetY()+prv.textContener.getHeight());
			prv.listContener.setWidth(prv.textContener.getWidth());
			prv.listContener.setDisplay('block');

		}


	}

	prv.setValue=function(id,label){
		prv.field.setValue(id);

		prv.textContener.setValue(label);
		prv.listContener.setDisplay('none');

	}

	prv.clearValue=function(){
		prv.field.getAll('option').each(function(option){
			option.removeAttribute('selected'); //FIXME dorobić obsługę break
		});
	}

	pub.init();
});