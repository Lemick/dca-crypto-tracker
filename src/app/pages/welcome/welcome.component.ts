import {Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  investElements: InvestElement[];

  constructor(private investService: InvestService) {
    this.investService.getInvestElements().subscribe(value => this.investElements = value);
  }

  showModal(): void {
    this.investService.toggleInvestPopup(true);
  }
}
