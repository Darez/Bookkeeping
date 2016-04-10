Ite.registerModule('dialogBox',function(unsecureContent,secureContent){
	"use strict";
	var prv={};
	var pub=this;

	pub.createConfirm=function(message,callback){
		var dialogBox=pub.create();
		dialogBox.setTitle('Komunikat');
		dialogBox.setMessage(message);
		dialogBox.setButtonSubmit('Tak',function(){
			callback.call(this,true);
			this.close();
		});

		dialogBox.addButton('Nie',function(){
			callback.call(this,false);
			this.close();
		});

		return dialogBox;
	};


	pub.create=function(){
		return new IteDialogBox();
	};


});

function IteDialogBox(){
	"use strict";

	var pub=this;
	var prv={};
	prv.message;
	prv.buttons=new IteArray();
	prv.closeButton=true;
	prv.eventsRendered=new IteArray();
	prv.eventsClose=new IteArray();
	prv.title='';
	prv.template;
	prv.submit;
	pub.setMessage=function(message){
		prv.message=message;
	};

	pub.setTitle= function (title) {
		prv.title=title;
	};

	pub.addButton=function(label,callback){
		prv.buttons.push([label,callback]);
	};

	pub.setButtonSubmit=function(label,callback) {
		prv.submit=[label,callback];
	};

	pub.setCloseButton=function(flag){
		pub.closeButton=flag;
	};

	pub.close=function(){
		prv.element.remove();
	};

	pub.getElement=function(){
		return prv.element;
	};

	pub.addEventRendered=function(callback){
		prv.eventsRendered.push(callback);
	};

	pub.addEventClose=function(callback){
		prv.eventsClose.push(callback);
	};

	pub.show=function(){
		var template=[];
		template.push('<div class="modal whisper-modal" tabindex="-1" role="dialog" style="display:block">');
		template.push('<div class="modal-dialog" role="document">');
		template.push('	<div class="modal-content">');
		template.push('		<div class="modal-header">');
		if(prv.closeButton){
			template.push('			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
		}
		template.push('			<h4 class="modal-title">'+prv.title+'</h4>');
		template.push('		</div>');
		template.push('		<form>');
		template.push('			<div class="modal-body">');
		template.push(prv.message);
		template.push('			</div>');
		template.push('			<div class="modal-footer">');
		template.push('			</div>');
		template.push('		</form>');
		template.push('	</div>');
		template.push('</div>');
		template.push('</div>');
		prv.element=Ite.createObject(template.join(''));
		if(prv.submit){
			var buttonElement=Ite.createObject('<button type="submit" class="btn btn-primary">'+prv.submit[0]+'</button>');
			prv.element.get('.modal-footer').append(buttonElement);
			prv.element.get('form').addEventSubmit(function(){
				prv.submit[1].call(pub);
			});
		}
		prv.buttons.each(function(button){
			var buttonElement=Ite.createObject('<button type="button" class="btn btn-default">'+button[0]+'</button>');
			buttonElement.addEventClick(function(){
				button[1].call(pub);
			});

			prv.element.get('.modal-footer').append(buttonElement);

		});
		if(prv.closeButton){
			prv.element.get('.close').addEventClick(function(e){
				pub.close();
				prv.eventsClose.each(function(item){
					item.call(pub);
				});
			});

		}

		Ite.get('body').append(prv.element);

		prv.eventsRendered.each(function(item){
			item.call(pub);
		});

	};
}