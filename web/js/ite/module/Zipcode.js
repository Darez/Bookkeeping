Ite.addElementModule('IteFieldObject','zipcode',function(){
	var private={};
	var public=this;

	private.render=function(){
		public.setMaxLength(6);
		public.addEventKeyDown(function(e){
			var event=e.getOrigin();
			if(event.keyCode>=48 && event.keyCode<=57 || event.keyCode==37 || event.keyCode==39 
			|| event.keyCode>=96 && event.keyCode<=105){//enter
				return private.inputEvent();
			}
			else if(event.keyCode==8){
				return private.backspaceEvent();
			}
			else if(event.keyCode==46){
				return private.deleteEvent();
			}
			else if(event.ctrlKey || event.keyCode==9 || event.keyCode==13){
			}
			else{
				return true;

			}

		});
	}

	private.inputEvent=function(){
		var re=new RegExp('^[0-9]{2}$');
		if(re.exec(public.getValue()) && public.getCursorPosition()==2){
			public.setValue(public.getValue()+'-');
		}
	}

	private.backspaceEvent=function(){
		var re=new RegExp('^[0-9]{2}-');
		if(re.exec(public.getValue()) && public.getCursorPosition()==3){
			public.setValue(public.getValue().substring(0,1));
			return true;

		}

	}

	private.deleteEvent=function(){
		var re=new RegExp('^[0-9]{2}-');
		if(re.exec(public.getValue()) && public.getCursorPosition()==2){
			public.setValue(public.getValue().substring(0,2));
			return true;

		}

	}

	private.render();
});
