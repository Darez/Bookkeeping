Ite.registerElement('ItePdfEditorElement','[role="pdf-editor"]',function(helper,htmlElement,parent){
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

		var imagePages=Ite.getAll('[role="pdf-editor-page"]');
		var pages=new IteArray();
		imagePages.each(function(){
			pages.push(this.getAttribute('data-image'));
		});

		var infoComponents=Ite.getAll('[role="pdf-editor-component"]');
		var components=new IteArray();
		infoComponents.each(function(){
			components.push({
				'name':this.getAttribute('data-name')
				,'page':this.getAttribute('data-page')
				,'positionX':this.getAttribute('data-position-x')
				,'positionY':this.getAttribute('data-position-y')
			});
		});

		prv.metaData['pages']=pages;
		prv.metaData['components']=components;

	};

	prv.render=function(){
		pub.addClass('pdf-editor');
		var template=`
		<DIV class="pdf-editor-workspace"></DIV>
		<DIV class="pdf-editor-ui">
		</DIV>
		`;

		pub.setHtml(template);

		prv.renderUI();

		prv.loadData();

		prv.bindUI();
	};

	prv.renderUI=function(){
		var template=`
			<FORM method="post">
				<BUTTON type="submit" class="pdf-editor-button" role="confirm">Confirm</BUTTON>
				<DIV class="pdf-editor-button" role="add">Add element</DIV>
				<DIV class="pdf-editor-info"></DIV>
			</FORM>
		`;

		pub.get('.pdf-editor-ui').setHtml(template);

	};

	prv.loadData=function(){
		var template='';
		prv.metaData['pages'].each(function(image,index){
			prv.pages.push(new ItePdfEditorPage(pub,image));
		});

		prv.metaData['components'].each(function(info,index){
			var component=new ItePdfEditorComponent(pub,info);
			pub.getPage(component.getPage()).addComponent(component);
			prv.focusComponent=component;
			prv.addComponentToUI(component);

		});

	};

	prv.bindUI=function(){
		pub.get('[role="add"]').addEventClick(prv.callbackAdd());
		var validator=pub.get('form').getValidator();
		validator.setFieldListener(prv.callbackFieldValid());
		validator.setEnable(true);
		pub.get('form').addEventSubmit(function(e){
			if(this.isValid() && this.getData()['data']){
				e.setSystemHandle(true);
			}
		});
	};

	prv.callbackFieldValid=function(){
		return function(field,correct){
			var form=field.getForm();
			if(correct){
				field.removeClass('pdf-editor-error');
			}
			else{
				field.addClass('pdf-editor-error');
			}

		};
	};

	prv.addComponentToUI=function(component){
		var container=pub.get('.pdf-editor-info');
		var index=prv.maxUIIndex++;
		var template=`
			<DIV>
				<TABLE>
					<TR><TH>Name</TH></TR>
					<TR><TD><INPUT type="TEXT" role="name" required name="data[${index}][name]" /></TD></TR>
					<TR><TH>Page</TH></TR>
					<TR><TD><INPUT type="number" role="page" required name="data[${index}][page]" min="1" /></TD></TR>
					<TR><TH>Position x</TH></TR>
					<TR><TD><INPUT type="number" role="positionX" required name="data[${index}][positionX]" min="0" /></TD></TR>
					<TR><TH>Position y</TH></TR>
					<TR><TD><INPUT type="number" role="positionY" required name="data[${index}][positionY]" min="0" /></TD></TR>
					<TR><TH>Font size</TH></TR>
					<TR><TD><INPUT type="number" role="fontSize" required name="data[${index}][fontSize]" min="1" /></TD></TR>
					<TR><TH>Max length</TH></TR>
					<TR><TD><INPUT type="number" role="maxLength" name="data[${index}][maxLength]" min="1" /></TD></TR>
					<TR><TH>Space</TH></TR>
					<TR><TD><INPUT type="number" role="space" name="data[${index}][space]" min="0" /></TD></TR>
					<TR><TH>Example text</TH></TR>
					<TR><TD><INPUT type="text" role="exampleText" name="data[${index}][exampleText]" /></TD></TR>
					<TR><TD><DIV class="pdf-editor-button" role="remove">Remove</DIV></TD></TR>
				</TABLE>
			</DIV>
		`;
		var item=Ite.createObject(template);
		container.append(item,0);

		item.get('[role="name"]').setValue(component.getName());
		item.get('[role="page"]').setValue(component.getPage());
		item.get('[role="positionX"]').setValue(component.getPositionX());
		item.get('[role="positionY"]').setValue(component.getPositionY());
		item.get('[role="fontSize"]').setValue(component.getFontSize());
		item.get('[role="maxLength"]').setValue(component.getMaxLength());
		item.get('[role="space"]').setValue(component.getSpace());
		item.get('[role="exampleText"]').setValue(component.getExampleText());

		item.get('[role="name"]').addEventChange(prv.callbackUIComponent(component,'setName'));
		item.get('[role="page"]').addEventChange(prv.callbackPage(component));
		item.get('[role="positionX"]').addEventChange(prv.callbackUIComponent(component,'setPositionX'));
		item.get('[role="positionY"]').addEventChange(prv.callbackUIComponent(component,'setPositionY'));
		item.get('[role="fontSize"]').addEventChange(prv.callbackUIComponent(component,'setFontSize'))
		item.get('[role="maxLength"]').addEventChange(prv.callbackUIComponent(component,'setMaxLength'))
		item.get('[role="space"]').addEventChange(prv.callbackUIComponent(component,'setSpace'))
		item.get('[role="exampleText"]').addEventChange(prv.callbackUIComponent(component,'setExampleText'))

		var muteEnter=function(e){
			var event=e.getOrigin();
			if(event.keyCode==13){//enter
				this.fireEvent('change');
				e.setSystemHandle(false);
			}
		};

		container.getAll('input').each(function(){
			this.addEventKeyDown(muteEnter);

		});

		item.get('[role="remove"]').addEventClick(prv.callbackRemove(item,component));

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

	prv.callbackRemove=function(container,component){
		return function(){
			var currentPage=pub.getPage(component.getPage());
			currentPage.removeComponent(component);
			container.remove();
		};
	};

	prv.callbackUIComponent=function(component,methodName){
		return function(){
			component[methodName].call(null,this.getValue());
		};

	};

	prv.callbackPage=function(component){
		return function(){
			var currentPage=pub.getPage(component.getPage());
			component.setPage(this.getValue());
			// currentPage.removeComponent(component);
			pub.getPage(this.getValue()).addComponent(component);

		};
	};

	prv.callbackAdd=function(){
		return function(){
			var component=new ItePdfEditorComponent(pub);
			pub.getPage(1).addComponent(component);
			prv.focusComponent=component;
			prv.addComponentToUI(component);
		}
	};

	prv.init();

});


function ItePdfEditorComponent(parent,config){
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

	pub.setPositionX=function(positionX){
		prv.positionX=positionX;
		pub.getElement().setPositionX(prv.positionX);
	};

	pub.setPositionY=function(positionY){
		prv.positionY=positionY;
		pub.getElement().setPositionY(prv.positionY);
	};

	pub.setPage=function(page){
		prv.page=page;
	};

	pub.setName=function(name){
		prv.name=name;
	};

	pub.setFontSize=function(fontSize){
		prv.fontSize=fontSize;
		pub.getElement().setFontSize(prv.fontSize);
	};

	pub.setMaxLength=function(maxLength){
		prv.maxLength=maxLength;
	};

	pub.setSpace=function(space){
		prv.space=space;
		pub.getElement().setLetterSpacing(prv.space);
	};

	pub.setExampleText=function(exampleText){
		prv.exampleText=exampleText;
		var element=pub.getElement();
		if(exampleText!=''){
			element.setText(exampleText);
		}
		else{
			element.setHtml('&nbsp;');			
		}
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
		prv.element=Ite.createObject(prv.getTemplate());
		pub.setFontSize(12);
		pub.setExampleText('');
		if(config){
			pub.setName(config.name);
			pub.setPage(config.page);
			pub.setPositionX(config.positionX);
			pub.setPositionY(config.positionY);

		}
	};

	prv.getTemplate=function(){
		return `
			<DIV class="pdf-editor-component">
			</DIV>
		`;

	};

	prv.init();

};

function ItePdfEditorPage(parent,image){
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
		prv.element.get('.pdf-editor-page-content').append(component.getElement());
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
			<DIV class="pdf-editor-page">
				<SPAN class="pdf-editor-page-content">
					<IMG src=${prv.image} />
				</SPAN>
			</DIV>
		`;
		prv.element=Ite.createObject(template);
		prv.parent.get('.pdf-editor-workspace').append(prv.element);
	};

	pub.getElement=function(){
		return prv.element;
	};

	prv.init();

};

