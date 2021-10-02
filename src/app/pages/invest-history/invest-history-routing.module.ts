import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InvestHistoryComponent} from './invest-history.component';

const routes: Routes = [
  { path: '', component: InvestHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvestHistoryRoutingModule { }
