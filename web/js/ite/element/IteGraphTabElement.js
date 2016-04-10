Ite.registerElement('IteGraphTabElement','[role="graph"]',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);
	prv.collection;
	prv.columns=new IteArray();
	prv.formatters=new IteArray();
	prv.updatedEvents=new IteArray();
	prv.margin=20;

	prv.axisXLabel=new IteArray();
	prv.barStyle={};

	//extend	
	Ite.extend(pub,'IteSvgElement',htmlElement,prv.scope);

	prv.init=function(){
		prv.barStyle['color']='#000000';
		prv.build();
		prv.collection=Ite.createCollection();
		prv.collection.addEventChange(prv.refresh);

	};

	pub.addAxisXLabel=function(label){
		prv.axisXLabel.push(label);
	};

	pub.getCollection=function(){
		return prv.collection;
	};

	pub.setBarColor=function(color){
		prv.barStyle['color']=color;
	};

	prv.build=function(){
		var height=pub.getHeight()-(prv.margin*2);
		var template=[];
		template.push('<g role="contener" transform="translate(40,'+prv.margin+')">');
		template.push('<g class="x axis" role="axis-x" transform="translate(0,'+height+')"></g>');
		template.push('<g class="y axis" role="axis-y"></g>');
		template.push('<g role="bars"></g>');
		template.push('</g>');

		pub.setHtml(template.join(''));

		prv.refreshAxisY(0);
		prv.refreshAxisX(0);

	};

	prv.refresh=function(){
		var maxY=0;
		var mapValues={};
		prv.collection.each(function(record,id){
			mapValues[id]=record.value;
			if(record.value>maxY){
				maxY=record.value;
			}
		});

		prv.refreshAxisY(maxY);
		prv.refreshAxisX();
		prv.refreshBar(mapValues,maxY);
	}

	prv.refreshAxisX=function(){
		var maxWidth=pub.getWidth()-60;
		var countStep=prv.axisXLabel.length();

		var axis=pub.get('[role="axis-x"]');
		var stepWidth=maxWidth/countStep;

		var template='';
		for(var i=0; i<countStep; i++){
			template+='<g class="tick" transform="translate('+(stepWidth*i+prv.margin-10)+',0)" style="opacity: 1;"><line y2="6" x2="0"></line><text dy=".71em" y="9" x="0" style="text-anchor: middle;">'+prv.axisXLabel[i]+'</text></g>';
		}

		template+='<path class="domain" d="M0,6V0H'+maxWidth+'V6"></path>';

		axis.setHtml(template);

	};

	prv.refreshAxisY=function(value){
		var maxHeight=pub.getHeight()-prv.margin;
		var countStep=5;

		var axis=pub.get('[role="axis-y"]');
		var stepHeight=maxHeight/countStep;
		var stepValue=value/(countStep-1);

		var template='';
		var lastValue=0;
		for(var i=1; i<=countStep; i++){
			var currentValue=Math.ceil((countStep-i)*stepValue);
			if(lastValue!=currentValue){
				template+='<g class="tick" transform="translate(0,'+(stepHeight*i-prv.margin)+')"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">'+currentValue+'</text></g>'
			}

			lastValue=currentValue;
		}

		template+='<path class="domain" d="M-6,0H0V'+(maxHeight-prv.margin)+'H-6"></path>';

		axis.setHtml(template);

	};

	prv.refreshBar=function(map,maxValue){
		var maxHeight=pub.getHeight()-(prv.margin*2);
		var contener=pub.get('[role="bars"]');
		var stepHeight=maxHeight/maxValue;

		var maxWidth=pub.getWidth()-60;
		var countWidthStep=prv.axisXLabel.length();
		var stepWidth=maxWidth/countWidthStep;


		var template='';
		var column=0;
		prv.axisXLabel.each(function(label){
			var value=map[label];
			value=value||0;
			var heightBar=stepHeight*value;
			template+='<rect class="bar" x="'+(column*stepWidth+5)+'" y="'+(maxHeight-heightBar)+'" width="'+(stepWidth/2)+'" height="'+heightBar+'" style="fill:'+prv.barStyle['color']+'"></rect>';
			column++;
			// return true;
		});

		contener.setHtml(template);

		// axis.append(node);				

	};

	prv.init();

});
