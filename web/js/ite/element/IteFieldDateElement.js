Ite.registerElement('IteFieldDateElement','input[type="date"]',function(helper,htmlElement,parent){
	"use strict";
	var prv={};
	var pub=this;
	prv.helper=helper;
	prv.valueDate;
	prv.valueTime;
	prv.selectedDay=null;
	prv.isBind=false;

	prv.scope=(parent!=undefined?parent:pub);
	//extend	
	Ite.extend(pub,'IteFieldElement',htmlElement,prv.scope);

	prv.getFormatDate=function(date){
		var result=date.getFullYear();
		var month=date.getMonth()+1;
		var day=date.getDate();
		result+='-'+(month<10?'0':'')+month;
		result+='-'+(day<10?'0':'')+day;
		return result;
	};

	prv.getFormatTime=function(date){
		var hour=date.getHours();
		var minute=date.getMinutes();
		var result=(hour<10?'0':'')+hour;
		result+=':'+(minute<10?'0':'')+minute;
		return result;
	};

	prv.render=function(date,datePicker,field){

		var currentValue=new Date(field.getValue());
		var min=field.getMin();
		var max=field.getMax();

		if(min){
			min=new Date(min);
			min.setDate(min.getDate());	
		}

		if(max){
			max=new Date(max);
			max.setDate(max.getDate()+1);	

		}

		var thisDate=new Date();
		thisDate.setFullYear(date.getFullYear());
		thisDate.setMonth(date.getMonth());
		thisDate.setDate(1);
		var firstDayOfWeekObject=new Date(date);
		firstDayOfWeekObject.setDate(1);
		var firstDayOfWeek=firstDayOfWeekObject.getDay()-1;
		if(firstDayOfWeek<0)
			firstDayOfWeek=0;
		var lastDayOfMonthObject=new Date(date.getYear(),date.getMonth()+1,0);
		var lastDayOfMonth=lastDayOfMonthObject.getDate();
		var html="<tr>";
		var day=0;
		var label='';
		for(var i=1; i <=lastDayOfMonth+firstDayOfWeek;i++){

			if(i-firstDayOfWeek>0){
				day=thisDate.getDate();
				label=day;

				if(currentValue.getDate()==day && currentValue.getMonth()==date.getMonth() && currentValue.getFullYear()==date.getFullYear())
					html+='<td class="data-picker-active">'+label+'</td>';
				else if(prv.acceptRange(min,max,thisDate))
					html+="<td>"+label+"</td>";
				else
					html+='<td class="data-picker-disable">'+label+'</td>';
				thisDate.setDate(thisDate.getDate()+1);

			}
			else
				html+='<td></td>';


			if(i%7==0){
				html+='</tr><tr>';
			}

		}

		datePicker.get('.date-picker-title').setHtml(prv.getMonthName(date)+' '+date.getFullYear());

		datePicker.get('table tbody').setHtml(html);
		datePicker.getAll('table tbody td').each(function(value){
			value.addEventClick(function(e){
				var val=this.getHtml();
				if(val!='' && !this.isClass('data-picker-disable')){
					date.setDate(val);
					field.setValue(prv.getFormatDate(date));
					datePicker.remove();

				}
			});
		});

	};

	prv.unselectDay=function(datePicker){
		datePicker.getAll('table tbody td.data-picker-active').each(function(){
			this.removeClass('data-picker-active');
		});
	};

	prv.acceptRange=function(min,max,date){
		var minCorrect=true;
		var maxCorrect=true;
		if(min){
			minCorrect=min.getTime()<=date.getTime();
		}
		if(max){
			maxCorrect=max.getTime()>=date.getTime();
		}
		return minCorrect && maxCorrect;

	};

	prv.months=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
	prv.getMonthName=function(date){
		return prv.months[date.getMonth()];
	}

	prv.callbackActive=function(e){
		Ite.blur();
		prv.hideAllDatePickers();
		if(this.getValue()==''){
			var date=new Date();
			prv.selectedDay=null;
		}
		else{
			var date=new Date(this.getValue());
		}
	
		var html='<div class="date-picker">'+
		'	<div class="date-picker-header">'+
		'		<div class="date-picker-prev-year data-picker-navigate"></div>'+
		'		<div class="date-picker-prev-month data-picker-navigate"></div>'+
		'		<div class="date-picker-title"></div>'+
		'		<div class="date-picker-next-month data-picker-navigate"></div>'+
		'		<div class="date-picker-next-year data-picker-navigate"></div>'+
		'		<div class="date-picker-clear data-picker-navigate"></div>'+
		'	</div>'+
		'	<table>'+
		'		<thead>'+
		'			<tr>'+
		'				<th>Pon</th>'+
		'				<th>Wto</th>'+
		'				<th>Śro</th>'+
		'				<th>Czw</th>'+
		'				<th>Pią</th>'+
		'				<th>Sob</th>'+
		'				<th>Nie</th>'+
		'			</tr>'+
		'		</thead>'+
		'		<tbody>'+
		'		</tbody>'+
		'	</table>'+
		'</div>';

		var field=this;
		var datePicker=Ite.createObject(html);

		datePicker.get('.date-picker-prev-month').addEventClick(function(e){
			e.setPropagation(false);
			date.setMonth(date.getMonth()-1);
			prv.render(date,datePicker,field);
		});

		datePicker.get('.date-picker-next-month').addEventClick(function(e){
			e.setPropagation(false);
			date.setMonth(date.getMonth()+1);
			prv.render(date,datePicker,field);
		});

		datePicker.get('.date-picker-prev-year').addEventClick(function(e){
			e.setPropagation(false);
			date.setFullYear(date.getFullYear()-1);
			prv.render(date,datePicker,field);
		});

		datePicker.get('.date-picker-next-year').addEventClick(function(e){
			e.setPropagation(false);
			date.setFullYear(date.getFullYear()+1);
			prv.render(date,datePicker,field);
		});

		datePicker.get('.date-picker-clear').addEventClick(function(e){
			e.setPropagation(false);

			field.setValue('');
			datePicker.remove();
		});

		datePicker.addEventClick(function(e){
			e.setPropagation(false);
			e.setSystemHandle(true);
		});

		prv.render(date,datePicker,field);

		this.getParent().append(datePicker);

	}

	prv.bind=function(){
		if(!prv.isBind){
			prv.isBind=true;

			Ite.addEventClick(prv.hideAllDatePickers);
		}
	}

	prv.hideAllDatePickers=function(e){
		if(e){
			e.setSystemHandle(true);
		}

		Ite.getAll('.date-picker').each(function(value){
			value.remove();
		});

	};

	pub.getValue=function(){
		var value=pub.getDOMElement().value;

		if(value!=''){
			return value;
		}
		return '';
	};

	//construct

	pub.setType('text');
	pub.addEventFocus(prv.callbackActive);
	pub.addEventClick(function(e){
		e.setPropagation(false);
	});

	prv.bind();

});