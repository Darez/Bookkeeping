
//validator config
Ite.validator().setFieldListener(function(field,correct){
	var form=field.getForm();
	if(form.isDirty() && !field.isDisabled()){
		var object=field;
		if(field.getType()=='checkbox'){
			object=field.getParent();
		}

		var parent=object.getParent()
		if(correct){
			Ite.try(function(){
				parent.get('.parsley-errors-list').remove();
				parent.removeClass('has-error');
			}).catch(ObjectNotFoundException,function(error){
				//ignore
			});

		}
		else{
			Ite.try(function(){
				parent.get('.parsley-errors-list');
			}).catch(ObjectNotFoundException,function(error){
				var templateError='<ul class="parsley-errors-list filled"><li class="parsley-required">Invalid data</li></ul>'
				parent.addClass('has-error');
				parent.append(Ite.createObject(templateError));
			});

		}

	}

});

// Ite.route().addEventChange(function(){
// 	Ite.loadMask().show();
// });

// Ite.route().addEventChanged(function(){
// 	Ite.loadMask().hide();
// });

Ite.run(function(config){

	var route=config.getRoute();

	route.addRule('^/managment/form/add$','ManagmentForm::add');
	route.addRule('^/managment/form/add/finish$','ManagmentForm::addFinish');

});