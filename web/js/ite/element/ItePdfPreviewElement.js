Ite.registerElement('ItePdfPreviewElement','[role="pdf-preview"]',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;

	prv.helper=helper;
	prv.scope=(parent!=undefined?parent:pub);

	//extend	
	Ite.extend(pub,'IteElement',htmlElement,prv.scope);

	prv.metaData={};
	prv.pages=new IteArray();
	prv.maxUIIndex=0;

	prv.init=function(){
		prv.loadMetaData();
		prv.render();
	};

	prv.loadMetaData=function(){

		var imagePages=Ite.getAll('[role="pdf-preview-page"]');
		var pages=new IteArray();
		imagePages.each(function(){
			pages.push(this.getAttribute('data-image'));
		});

		var infoComponents=Ite.getAll('[role="pdf-preview-component"]');
		var components=new IteArray();
		infoComponents.each(function(){
			components.push({
				'name':this.getAttribute('data-name')
				,'page':this.getAttribute('data-page')
				,'positionX':this.getAttribute('data-position-x')
				,'positionY':this.getAttribute('data-position-y')
				,'space':this.getAttribute('data-space')
				,'fontSize':this.getAttribute('data-font-size')
			});
		});

		prv.metaData['pages']=pages;
		prv.metaData['components']=components;

	};

	prv.render=function(){
		pub.addClass('pdf-preview');
		var template=`<FORM method="post">
			<DIV class="pdf-preview-workspace"></DIV>
			<BUTTON type="submit" class="pdf-editor-button" role="confirm">Confirm</BUTTON>
		</FORM>
		`;

		pub.setHtml(template);

		prv.loadData();
	};

	prv.loadData=function(){
		var template='';
		prv.metaData['pages'].each(function(image,index){
			prv.pages.push(new ItePdfPreviewPage(pub,image));
		});

		prv.metaData['components'].each(function(info,index){
			var component=new ItePdfPreviewComponent(pub,info);
			pub.getPage(component.getPage()).addComponent(component);

		});

	};

	pub.getPage=function(page){
		return prv.pages.get(page-1);
	};

	pub.addEventSubmit=function(callback){
		pub.get('form').addEventSubmit(callback);
	};

	pub.getData=function(){
		return pub.get('form').getData();
	};

	prv.init();

});


function ItePdfPreviewComponent(parent,config){
	"use strict";
	var prv={};
	var pub=this;

	prv.parent=parent;

	prv.page=1;
	prv.name='';
	prv.positionX=0;
	prv.positionY=0;
	prv.fontSize=10;
	prv.maxLength=null;
	prv.space=0;
	prv.exampleText='';

	prv.element;

	pub.getName=function(){
		return prv.name;
	};

	pub.getPage=function(){
		return prv.page;
	};

	pub.getTitle=function(){
		return prv.title;
	};

	pub.getPositionX=function(){
		return prv.positionX;
	};

	pub.getPositionY=function(){
		return prv.positionY;
	};

	pub.getFontSize=function(){
		return prv.fontSize;
	};

	pub.getMaxLength=function(){
		return prv.maxLength;
	};

	pub.getSpace=function(){
		return prv.space;
	};

	pub.getExampleText=function(){
		return prv.exampleText;
	};

	pub.getData=function(){
		return {
			'page':pub.getPage()
			,'name':pub.getName()
			,'positionX':pub.getPositionX()
			,'positionY':pub.getPositionY()
			,'fontSize':pub.getFontSize()
			,'maxLength':pub.getMaxLength()
			,'exampleText':pub.getExampleText()
		};
	};

	pub.getElement=function(){
		return prv.element;
	};

	prv.init=function(){
		prv.name=config.name;
		prv.positionY=config.positionY;
		prv.positionX=config.positionX;
		prv.fontSize=config.fontSize;
		prv.maxlength=config.maxlength;
		prv.space=config.space;
		prv.element=Ite.createObject(prv.getTemplate());
		prv.element.setFontSize(pub.getFontSize());
		prv.element.setPositionX(pub.getPositionX());
		prv.element.setPositionY(pub.getPositionY());
		prv.element.setLetterSpacing(pub.getSpace());

	};

	prv.getTemplate=function(){
		return `
			<INPUT type="text" class="pdf-preview-component" maxlength="${pub.getMaxLength()}" name="${pub.getName()}" />
		`;

	};

	prv.init();

};

function ItePdfPreviewPage(parent,image){
	"use strict";
	var prv={};
	var pub=this;

	prv.parent=parent;

	prv.image=image;
	prv.components={};
	prv.componentMaxIndex=0;
	prv.element;

	pub.getComponents=function(){
		var result=new IteArray();
		for(var component in prv.components){
			result.push(prv.components[component]);
		}

		return result;
	};

	pub.addComponent=function(component){
		prv.components[prv.componentMaxIndex++]=component;
		prv.element.get('.pdf-preview-page-content').append(component.getElement());
	};

	pub.removeComponent=function(component){
		component.getElement().remove();
		for(var index in prv.components){
			if(prv.components[index]!=component){
				continue;
			}

			delete prv.components[index];
			return;
		}

		throw new ObjectNotFoundException('');
	};

	prv.init=function(){

		var template=`
			<DIV class="pdf-preview-page">
				<SPAN class="pdf-preview-page-content">
					<IMG src=${prv.image} />
				</SPAN>
			</DIV>
		`;
		prv.element=Ite.createObject(template);
		prv.parent.get('.pdf-preview-workspace').append(prv.element);
	};

	pub.getElement=function(){
		return prv.element;
	};

	prv.init();

};

