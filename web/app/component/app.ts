import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {ManagmentFormComponent} from '/app/component/managment/form';
import {ManagmentFormAddComponent} from '/app/component/managment/form.add';

@Component({
  selector: 'my-app',
  template: `
   <!-- Static navbar -->
    <nav class="navbar navbar-default navbar-static-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Bookkeeping</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Forms <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li><a href="/questionnaire/proposal_benefit">todo</a></li>
              </ul>
            </li>
          </ul>
          <ul class="nav navbar-nav">
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Managment <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li><a [routerLink]="['ManagmentForm']">Forms</a></li>
              </ul>
            </li>
          </ul>

        </div><!--/.nav-collapse -->
      </div>
    </nav>


    <div class="container">

      <router-outlet></router-outlet>
    </div> <!-- /container -->

  `,
  // providers:  [DialogService, HeroService],
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([

  { 
    path: '/managment/form',
    name: 'ManagmentForm',
    component: ManagmentFormComponent,
  }
  ,{ 
    path: '/managment/form/add',
    name: 'ManagmentFormAdd',
    component: ManagmentFormAddComponent,
  }

])
export class AppComponent { }


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/