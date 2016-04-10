Ite.api().setCallbackLogged(function(data){
	Ite.get('.session-info .username-value td').setText(data.userName);
	Ite.get('.session-info .primaryNumber-value td').setText(data.primaryNumber);
	Ite.get('.session-info .profile-value td .label').setText(data.defaultProfile);

});

Ite.api().addFailListener(function(code,message,headers){
	if(code==401 && headers['x-location']){
		Ite.tabRoute().redirect(headers['x-location']);
	}
	else
		Ite.notify().addError(message);

});

Ite.tabRoute().addEventLoadTemplateFail(function(template,code,data,headers){
	if(code==401 && headers['x-location']){
		Ite.route().redirect(headers['x-location']);
	}
	else
		Ite.notify().addError(data);
});

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
			try{
				parent.get('.parsley-errors-list').remove();
			}
			catch(e){

				//ignore
			}

		}
		else{
			try{
				parent.get('.parsley-errors-list');
			}
			catch(e){ //add when not exist
				var templateError='<ul class="parsley-errors-list filled"><li class="parsley-required">Niepoprawny format danych.</li></ul>'
				parent.addClass('has-error');
				parent.append(Ite.createObject(templateError));
			}



		}

	}

});

// Ite.validator().setFormListener(function(correct){
// 	if(!correct){
// 		try{
// 			Ite.get('.has-error .form-control').focus();
// 		}
// 		catch(err){
// 			//ignore
// 		}
// 	}
// })

Ite.tabRoute().addEventChanged(function(){
	Ite.getAll('.widget');
});

//route
Ite.tabRoute().setContener('.container');


Ite.run(function(config){
	var route=config.getRoute();

	route.addRule('^/queue$','QueueIndex','queue-page');
	route.addRule('^/queue/add$','QueueAdd','queue-add-page');
	route.addRule('^/queue/edit/([0-9]+)$','QueueEdit','queue-add-page');

	route.addRule('^/voip$','VoipIndex','voip-page');
	route.addRule('^/voip/add$','VoipAdd','voip-add-page');
	route.addRule('^/voip/edit/([0-9]+)$','VoipEdit','voip-add-page');

	route.addRule('^/user$','UserIndex','user-page');
	route.addRule('^/user/add$','UserAdd','user-add-page');
	route.addRule('^/user/edit/([0-9]+)$','UserEdit','user-add-page');

	route.addRule('^/primaryNumber$','PrimaryNumberIndex','primaryNumber-page');
	route.addRule('^/primaryNumber/edit/([0-9]+)$','PrimaryNumberEdit','primaryNumber-edit-page');
	route.addRule('^/primaryNumber/add$','PrimaryNumberAdd','primaryNumber-add-page');

	route.addRule('^/callCenter$','CallCenterIndex','callCenter-page');
	route.addRule('^/callCenter/add$','CallCenterAdd','callCenter-add-page');
	route.addRule('^/callCenter/edit/([0-9]+)$','CallCenterEdit','callCenter-add-page');

	route.addRule('^/profile$','ProfileIndex','profile-page');
	route.addRule('^/profile/add$','ProfileAdd','profile-add-page');
	route.addRule('^/profile/edit/([0-9]+)$','ProfileEdit','profile-add-page');

	route.addRule('^/queueShow$','QueueShow','queueShow-index-page');

	route.addRule('^/transfer$','TransferIndex','transfer-page');
	route.addRule('^/transfer/add$','TransferAdd','transfer-add-page');
	route.addRule('^/transfer/edit/([0-9]+)$','TransferEdit','transfer-add-page');

	route.addRule('^/pause$','PauseIndex','pause-page');
	route.addRule('^/pause/add$','PauseAdd','pause-add-page');
	route.addRule('^/pause/edit/([0-9]+)$','PauseEdit','pause-add-page');

	// route.addRule('^/soundStatementCategory$','SoundStatementCategory::index','/soundStatementCategory.html');
	// route.addRule('^/soundStatementCategory/add$','SoundStatementCategory::add','/soundStatementCategory/add.html');
	// route.addRule('^/soundStatementCategory/edit/([0-9]+)$','SoundStatementCategory::edit','/soundStatementCategory/edit/{1}.html');

	route.addRule('^/soundStatement$','SoundStatementIndex','soundStatement-page');
	route.addRule('^/soundStatement/add$','SoundStatementAdd','/soundStatement/add.html');
	route.addRule('^/soundStatement/edit/([0-9]+)$','SoundStatementEdit','/soundStatement/edit/{1}.html');

	route.addRule('^/store$','StoreIndex','store-page');
	route.addRule('^/store/add$','StoreAdd','store-add-page');
	route.addRule('^/store/edit/([0-9]+)$','StoreEdit','store-add-page');

	route.addRule('^/client/sell(/[0-9]+|)$','ClientSell','clientSell-index-page');

	route.addRule('^/clientStatus$','ClientStatusIndex','clientStatus-index-page');
	route.addRule('^/clientStatus/add$','ClientStatusAdd','clientStatus-add-page');
	route.addRule('^/clientStatus/edit/([0-9]+)$','ClientStatusEdit','clientStatus-add-page');

	route.addRule('^/callback$','Callback','callback-index-page');
	route.addRule('^/callback/edit/([0-9]+)$','CallbackEdit','callback-edit-page');

	route.addRule('^/pbx$','PBXIndex','pbx-index-page');

	route.addRule('^/clientCallback$','ClientCallback','clientCallback-index-page');
	route.addRule('^/clientCallback/edit/([0-9]+)$','ClientCallbackEdit','clientCallback-edit-page');

	route.addRule('^/record$','Record','record-page');

	route.addRule('^/campaign$','CampaignIndex','campaign-page');
	route.addRule('^/campaign/add$','CampaignAdd','campaign-add-page');
	route.addRule('^/campaign/edit/([0-9]+)$','CampaignEdit','campaign-edit-page');

	route.addRule('^/campaignShow$','CampaignShow','campaignShow-index-page');

	route.addRule('^/log$','LogIndex','log-index-page');
	route.addRule('^/log/show/([0-9]+)$','LogShow','log-show-page');

	route.addRule('^/role$','RoleIndex','role-index-page');
	route.addRule('^/role/add$','RoleAdd','role-add-page');
	route.addRule('^/role/edit/([0-9]+)$','RoleEdit','role-add-page');

	route.addRule('^/group$','GroupIndex','group-index-page');
	route.addRule('^/group/add$','GroupAdd','group-add-page');
	route.addRule('^/group/edit/([0-9]+)$','GroupEdit','group-add-page');

	route.addRule('^/skill$','SkillIndex','skill-index-page');

	route.addRule('^/setting$','SettingIndex','setting-index-page');

	route.addRule('^/profileUser$','ProfileUserIndex','profileUser-index-page');

	route.addRule('^/report\/userStatus$','ReportUserStatus','report-userStatus-page');

	route.addRule('^/report\/userWork$','ReportUserWork','report-userWork-page');
	route.addRule('^/report\/call$','ReportCall','report-call-page');
	route.addRule('^/report\/callOutWork','ReportCallOutWork','report-callOutWork-page');
	route.addRule('^/report\/userSumWork','ReportUserSumWork','report-userSumWork-page');
	route.addRule('^/report\/kPITCOK','ReportKPITCOK','report-kPITCOK-page');
	route.addRule('^/report\/kPITT','ReportKPITT','report-kPITT-page');
	route.addRule('^/report\/noAnswer','ReportNoAnswer','report-noAnswer-page');


	Ite.api().connect();
});

Ite.tabRoute().call('VoipPanel::index');
Ite.tabRoute().call('SessionPanel');

Ite.tabRoute().call('Reminder::index');

Ite.tabRoute().call('WidgetQueueWaiting::index');
Ite.tabRoute().call('WidgetStatisticsDay::index');


Ite.tabRoute().call('WidgetManager::index');



//global tutorial
Ite.tutorial().add('app-introduction','Witaj w systemi call center. Jest to samouczek, który objaśni najważniejsze funkcje. Aby przejść dalej kliknij lewym przyciskiem myszy. Aby przerwać tutorial, wybierz przycisk "Pomiń".');

Ite.tutorial().add('app-menu','Intefejs do nawigacji znajdziemy tutaj.',Ite.get('.navbar-nav'));

Ite.try(function(){
	var elementTutorial=Ite.get('.main-menu-monitor');
	Ite.tutorial().add('app-menu-monitoring','To menu jest odpowiedzialne za monitoring co dzieje się na infolinii.',elementTutorial);
}).catch(ObjectNotFoundException,function(){
	//ignore
});

Ite.try(function(){
	var elementTutorial=Ite.get('.main-menu-report');
	Ite.tutorial().add('app-menu-report','To menu jest odpowiedzialne za raporty z pracy infolinii.',elementTutorial);
}).catch(ObjectNotFoundException,function(){
	//ignore
});

Ite.try(function(){
	var elementTutorial=Ite.get('.main-menu-client');
	Ite.tutorial().add('app-menu-client','To menu jest odpowiedzialne za obsługę klienta.',elementTutorial);
}).catch(ObjectNotFoundException,function(){
	//ignore
});

Ite.try(function(){
	var elementTutorial=Ite.get('.main-menu-log');
	Ite.tutorial().add('app-menu-log','To menu jest odpowiedzialne za logi systemowe.',elementTutorial);
}).catch(ObjectNotFoundException,function(){
	//ignore
});

Ite.try(function(){
	var elementTutorial=Ite.get('.main-menu-setting');
	Ite.tutorial().add('app-setting','To menu jest odpowiedzialne za ustawienia związane z kontem i całym systemem.',elementTutorial);
}).catch(ObjectNotFoundException,function(){
	//ignore
});

Ite.tutorial().add('app-menu-logout','Dzięki temu przyciskowi możemy się wylogować z systemu, ale nie z telefonu (jeśli byłeś do niego wcześniej zalogowany).',Ite.get('.main-menu-logout'));

Ite.tutorial().add('app-menu-widget','Po wciśnięciu tego przycisku możemy rozwinąc lub schować prawy panel z widżetami.',Ite.get('.widgetManagerShow'));


$('.widget').widgster();
