Ite.registerModule('contextMenu',function(){
	"use strict";
	var prv={};
	var pub=this;
    prv.menu=null;
	pub.show=function(buttons){
		pub.close();
		var html='<ul class="dropdown-menu context-menu" role="menu" >';
		var index=0;
		for(var key in buttons){
			html+='<li><a data-id="'+index+'" tabindex="-1" href="">'+key+'</a></li>';
			index++;
		}
		html+='</ul>';
		var element=Ite.createObject(html);
		element.setPositionX(Ite.getScrollLeft()+prv.pageX);
		element.setPositionY(Ite.getScrollTop()+prv.pageY);
		prv.menu=element;
		Ite.get('body').append(element);
		index=0;
		for(var key in buttons){
			(function(key){
				prv.menu.get('[data-id="'+index+'"]').addEventClick(function(e){
					buttons[key].call(null);
					pub.close();
				});

			}(key));
			index++;
		}

	};

	pub.close=function(){
		if(prv.menu){
			prv.menu.remove();
			prv.menu=null;
		}
	};

	prv.construct=function(){
		Ite.addEventMouseMove(function(e){
			var event=e.getOrigin();

			 var dot, eventDoc, doc, body, pageX, pageY;

	        event = event || window.event; // IE-ism

			prv.pageX = event.clientX||event.pageX;
			prv.pageY = event.clientY||event.pageY;
		});

		var destroyMenu=function(e){
			e.setSystemHandle(true);
			var element=e.getTarget();
			try{
				var parent=element.getParent('.context-menu');
			}catch(err){
				pub.close();
			}
		};

		Ite.addEventClick(destroyMenu);

	};

	prv.construct();

});