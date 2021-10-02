import {Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';

@Component({
  selector: 'app-invest-history',
  templateUrl: './invest-history.component.html',
  styleUrls: ['./invest-history.component.css']
})
export class InvestHistoryComponent {

  investElements: InvestElement[];

  constructor(private investService: InvestService) {
    this.investService.getInvestElements().subscribe(value => this.investElements = value);
  }

  showModal(): void {
    this.investService.toggleInvestPopup(true);
  }
}
