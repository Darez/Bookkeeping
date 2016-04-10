function IndexFilterController(id,label,url){
	"use strict";
	var prv={};
	var pub=this;

	prv.maxPage=1;
	prv.table;

	pub.getId=function(){
		return id;
	};

	pub.getName=function(){
		return label;
	};

	pub.getUrl=function(){
		return url;
	};

	pub.construct=function(tab){
		prv.content=tab;
		var collection=Ite.createCollection();
		collection.setProvider({
			execute:function(args,callback){
				Ite.api().execute(prv.content,pub.getUrl(),args,function(data){
					prv.maxPage=data.maxPage;
					prv.refresPaginate(data.page,data.maxPage);
					collection.setMetaData('page',data.page);
					callback.call(null,data.records);
				});

			}
		});
		prv.table=tab.getBody().get('table');
		prv.table.setCollection(collection);
		prv.bind();
		collection.setMetaData('page',1);
		collection.refresh();
	};

	pub.configureFilter=function(content){
	};

	prv.bind=function(){
		var collection=prv.table.getCollection();
		collection.addEventChange(function(){
			prv.table.getAll('.action-remove').each(function(){
				this.addEventClick(prv.callbackRemove);
			});
		});

		prv.table.get('tfoot form select').addEventChange(function(){
			collection.setMetaData('page',this.getValue());
			collection.refresh();
		});

		prv.table.get('tfoot form [role="paginate-prev"]').addEventClick(function(){
			var currentPage=collection.getMetaData('page');
			if(currentPage>1){
				collection.setMetaData('page',currentPage-1);
				collection.refresh();

			}
		});

		prv.table.get('tfoot form [role="paginate-next"]').addEventClick(function(){
			var currentPage=collection.getMetaData('page');
			if(currentPage<prv.maxPage){
				collection.setMetaData('page',currentPage+1);
				collection.refresh();

			}
		});

		prv.content.getBody().get('[role="filter"]').addEventSubmit(function(){
			var collection=prv.table.getCollection();
			var values=this.getValues();
			for(var key in values){
				collection.setMetaData(key,values[key]);
			}

			collection.refresh();
		});
		pub.configureFilter(prv.content);

	};

	prv.refresPaginate=function(page,maxPage){
		var field=prv.table.get('tfoot form select');
		var collection=field.getCollection();
		collection.clear();
		var records=[];

		for(var i=1; i<=maxPage; i++){
			records.push({id:i,name:i});
		}
		collection.pushAll(records);
		field.setValue(page,true);

	};

	prv.callbackRemove=function(){
		var me=this;
		var dialog=Ite.dialogBox().createConfirm('Czy na pewno usunąć?',function(flag){
			if(!flag){
				return;
			}

			Ite.api().execute(prv.content,pub.getUrl()+'/remove',{id:me.getAttribute('data-id')},function(){
				me.getParent('tr').remove();
				Ite.notify().addInfo('Rekord usunięty.');
			});
		});

		dialog.show();
	};

};