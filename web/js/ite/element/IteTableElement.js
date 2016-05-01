Ite.registerElement('IteTableElement','table',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);
	prv.collection;
	prv.columns=new IteArray();
	prv.formatters=new IteArray();
	prv.updatedEvents=new IteArray();

	//extend	
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	prv.init=function(){

		prv.collection=Ite.createCollection();
		prv.collection.addEventChange(prv.refresh);

		prv.loadConfig();

	};

	prv.loadConfig=function(){
		pub.getAll('thead th').each(function(item){
			var id=prv.getOption(item,'id');
			if(!id){
				id=item.getText()
			}
			//sort
			var sort=prv.getOption(item,'sort')!=null;

			//sort
			var raw=prv.getOption(item,'raw')!=null;

			//format
			var formatter=prv.createDefaultFormatter();
			var template=prv.getOption(item,'template');
			if(template){
				formatter=prv.createTemplateFormatter(template,raw);
			}

			prv.columns.push({id:id,sort:sort,formatter:formatter});

			//bind sort
			if(sort){
				item.addEventClick(function(){
					if(prv.collection){
						prv.collection.sort(id);
					}
				});
			}
		});
	};

	prv.createTemplateFormatter=function(template,raw){
		return function(data){
			var html=template.replace(new RegExp('{data}', 'g'),data);
			if(!raw){
				html=Ite.escapeHtml(html);
			}
			return html;
		};
	};

	prv.getOption= function (item,name) {
		var result=null;
		Ite.try(function(){
			result=item.getAttribute('data-'+name);
		}).catch(AttributeNotFoundException ,function(){
			//ignore
		});

		return result;

	};

	prv.createDefaultFormatter=function(){
		return function(data){ return data;};
	};

	pub.addColumn=function(id,label,formatter){
		formatter=formatter||prv.createDefaultFormatter();
		prv.columns.push({id:id,sort:id,formatter:formatter});
		var template='<th data-id="'+id+'" data-name="'+id+'">'+label+'</th>;'
		pub.get('thead tr').append(Ite.createObject(template));
	};

	pub.addEventRightClickRecord=function(callback){
		pub.get('tbody').addEventRightClick(function(e){
			var cell=e.getTarget();
			var row=cell.getParent('tr');
			var id=row.getAttribute('data-id');

			var pos=cell.getChildPosition();
			var cellName=prv.columns.get(pos).id;
			var record=prv.collection.get(id);
			callback.call(null,record,cellName);
		});
	};

	pub.addEventClickRecord=function(callback){
		pub.get('tbody').addEventClick(function(e){
			var element=e.getTarget().getParent('tr');
			var id=element.getAttribute('data-id');
			var record=prv.collection.get(id);
			callback.call(null,record);
		});
	};

	pub.setCollection=function(collection){
		collection.clearEventChange();
		prv.collection=collection;
		prv.collection.addEventChange(prv.refresh);
		prv.refresh();
	}

	pub.getCollection=function(){
		return prv.collection;
	}

	pub.setFormatColumn=function(column,callback){
		var column=prv.columns[column-1];
		column.formatter=callback;
	}

	pub.setFormatColumns=function(callback){
		prv.columns.each(function(){
			this.formatter=callback;
		});
	};

	pub.addEventUpdated=function(callback){
		prv.updatedEvents.push(callback);
	};


	prv.refresh=function(){
		//FIXME jest to bardzo nie wydajne. Powinienem oznaczać rekordy przez id i modyfikować tylko to co się zmieniło
		pub.get('tbody').setHtml('');
		var template='';
		prv.collection.each(function(record,id){
			template+='<tr data-id="'+id+'">';
			prv.columns.each(function(column,i){
				var data=column.formatter.call(null,record[column.id],column.id);
				template+='<td>'+data+'</td>';
			});
			template+='</tr>';
		});
		pub.get('tbody').setHtml(template);

		prv.updatedEvents.each(function(callback){
			callback.call(pub);
		});
	}

	prv.init();

});
