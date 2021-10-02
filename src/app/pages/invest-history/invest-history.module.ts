import {NgModule} from '@angular/core';

import {InvestHistoryRoutingModule} from './invest-history-routing.module';

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
import {InvestHistoryComponent} from './invest-history.component';

@NgModule({
  imports: [
    InvestHistoryRoutingModule,
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
  declarations: [InvestHistoryComponent, AddInvestComponent],
  exports: [InvestHistoryComponent]
})
export class InvestHistoryModule {


}
