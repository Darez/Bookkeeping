import {Component}     from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

export class Item {
  constructor(public id: number, public title: string) { }
}

@Component({
  template:  `

		<table class="table">
			<thead>
				<tr>
					<th>#</th>
					<th>Nazwa</th>
				</tr>
			</thead>
			<tbody *ngFor="#item of items">
				<tr>
					<th scope="row">
						{{item.id}}
					</th>
					<td>
						{{item.title}}
					</td>
				</tr>
			</tbody>
			<tfoot>
				<tr><td colspan="2"><a [routerLink]="['ManagmentFormAdd']" class="btn btn-primary">Add</a></td></tr>
			</tfoot>
		</table>
  `,
   directives: [ROUTER_DIRECTIVES]
})

export class ManagmentFormComponent { 
	items=[]

	constructor(){
		this.items.push(new Item(1,'sasa'));
	}
}
