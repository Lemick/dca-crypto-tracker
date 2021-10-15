import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';
import {CryptoApiService} from '../../services/crypto-api.service';
import {CoinMarketPrice} from '../../model/CoinMarketPrice';
import {forkJoin, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

interface InvestElementGain {
  gainValue: number;
  gainRate: number;
}

@Component({
  selector: 'app-invest-history',
  templateUrl: './invest-history.component.html',
  styleUrls: ['./invest-history.component.css']
})
export class InvestHistoryComponent {

  isLoading = false;
  investElements: InvestElement[] = [];
  todayCoinsMarketPrices: Map<string, CoinMarketPrice> = new Map();
  investElementsGains: Map<InvestElement, InvestElementGain> = new Map();

  constructor(private investService: InvestService, private cryptoService: CryptoApiService) {
    this.investService.getInvestElements().subscribe(investElements => {
      this.isLoading = true;
      this.loadInvestElementsMarketData(investElements);
    });
  }

  showAddInvestModal(): void {
    this.investService.toggleAddInvestPopup(true);
  }

  showImportInvestModal(): void {
    this.investService.toggleImportInvestPopup(true);
  }

  calculateInvestGain(investElement: InvestElement): InvestElementGain {
    const coinMarketPrice = this.todayCoinsMarketPrices.get(investElement.coinId);
    const pastValue = investElement.valueAcquired * investElement.conversionRate;
    const currentValue = investElement.valueAcquired * coinMarketPrice.market_data.current_price[investElement.sourceCurrency];
    return {
      gainValue: currentValue - pastValue,
      gainRate: ((currentValue - pastValue) / pastValue) * 100
    };
  }

  loadInvestElementsMarketData(investElements: InvestElement[]): void {
    const distinctCoinIds = new Set(investElements.map(investElement => investElement.coinId));
    const coinPricesToFetch = new Array<Observable<CoinMarketPrice>>();
    for (const coinId of distinctCoinIds) {
      const coinPrice$ = this.cryptoService
        .fetchCoinPrice(coinId, new Date())
        .pipe(tap(coinPrice => this.todayCoinsMarketPrices.set(coinId, coinPrice)));
      coinPricesToFetch.push(coinPrice$);
    }
    forkJoin(coinPricesToFetch).subscribe(() => {
      investElements.forEach(investElement => {
        this.investElementsGains.set(investElement, this.calculateInvestGain(investElement));
      });
      this.isLoading = false;
      this.investElements = investElements;
    });
  }
}
