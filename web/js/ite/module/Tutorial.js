Ite.registerModule('tutorial',function(){
	"use strict";
	var prv={};
	var pub=this;
	prv.messages=new IteArray();
	prv.currentMessage=0;
	prv.actived=false;
	prv.tooltip;
	prv.elementMask;

	prv.init=function(){
	};

	pub.add=function(id,content,element){

		if(!Ite.getStorage().get('tutorial-message-'+id)){
			Ite.getStorage().set('tutorial-message-'+id,true);
			prv.messages.push({id:id,content:content,element:element});
			prv.show();
		}
	};

	prv.show=function(){
		if(!prv.actived){
			Ite.getStorage().set('tutorial-skip',true);
			prv.actived=true;
			prv.showMessage();
			prv.showSkipButton();
		}
	};

	prv.showSkipButton=function(){
		var skipButton=Ite.createObject('<a href="#" class="btn btn-danger btn-lg tutorial-skip-button">Pomiń</a>');
		Ite.get('body').append(skipButton);
		skipButton.addEventClick(function(){
			skipButton.remove();
			prv.tooltip.remove();
			prv.mask.remove();
			if(prv.elementMask){
				prv.elementMask.remove();
			}
		});
	};

	prv.showMessage=function(){
		var index=prv.currentMessage;
		var message=prv.messages[index];
		if(message==undefined){
			Ite.get('.tutorial-skip-button').remove();
			prv.actived=false;
			return;
		}

		prv.currentMessage++;

		prv.mask=Ite.createObject('<div class="tutorial-mask"></div>');

		prv.tooltip=Ite.createObject('<div class="tooltip-tutorial tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner">'+message.content+'</div></div>');

		Ite.get('body').append(prv.tooltip);

		var element=message.element;

		var tooltipPosition=[0,0];

		if(element){
			tooltipPosition=prv.getTooltipRelativeElementPosition(element);

		}
		else{
			tooltipPosition=[
				(Ite.get('body').getWidth()-prv.tooltip.getWidth())/2
				,(Ite.get('body').getHeight()-prv.tooltip.getHeight())/2
				];
		}

		prv.tooltip.setPositionX(tooltipPosition[0]);
		prv.tooltip.setPositionY(tooltipPosition[1]);


		if(element){
			prv.elementMask=Ite.createObject('<div class="tutorial-element-mask"></div>');
			prv.elementMask.setPositionX(element.getOffsetX());
			prv.elementMask.setPositionY(element.getOffsetY());
			prv.elementMask.setWidth(element.getWidth());
			prv.elementMask.setHeight(element.getHeight());

			Ite.get('body').append(prv.elementMask);

		}
		else{
			prv.mask.setBackgroundColor(0,0,0,0.2);
		}

		Ite.get('body').append(prv.mask);

		prv.mask.addEventClick(function(){
			prv.mask.remove();
			prv.tooltip.remove();
			if(element){
				prv.elementMask.remove();
			}
			prv.showMessage();
		});

	};

	prv.getTooltipRelativeElementPosition=function(element){
		var positionTooltipX=0;
		var positionTooltipY=0;

		prv.tooltip.addClass('left');
		positionTooltipX=element.getOffsetX()-prv.tooltip.getWidth();
		positionTooltipY=element.getOffsetY()-(prv.tooltip.getHeight()/2)+(element.getHeight()/2);
		if(positionTooltipX<0){//check right site
			prv.tooltip.removeClass('left');
			prv.tooltip.addClass('right');
			positionTooltipX=element.getOffsetX()+element.getWidth();
			positionTooltipY=element.getOffsetY()-(prv.tooltip.getHeight()/2)+(element.getHeight()/2);

			if(positionTooltipX+prv.tooltip.getWidth()>Ite.get('body').getWidth()){//check bottom
				prv.tooltip.removeClass('right');
				prv.tooltip.addClass('bottom');
				positionTooltipX=element.getOffsetX()+(element.getWidth()-prv.tooltip.getWidth())/2;
				positionTooltipY=element.getOffsetY()+element.getHeight();

			}
		}

		return [positionTooltipX,positionTooltipY];

	};

	prv.init();
});