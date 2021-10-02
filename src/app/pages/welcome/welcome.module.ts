import {NgModule} from '@angular/core';

import {WelcomeRoutingModule} from './welcome-routing.module';

import {WelcomeComponent} from './welcome.component';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzFormModule} from 'ng-zorro-antd/form';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import { AddInvestComponent } from './add-invest/add-invest.component';
import {NzTableModule} from 'ng-zorro-antd/table';

@NgModule({
  imports: [
    WelcomeRoutingModule,
    NzModalModule,
    NzButtonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule,
    CommonModule,
    NzIconModule,
    FormsModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzTableModule
  ],
  declarations: [WelcomeComponent, AddInvestComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule {


}
