import {ChangeDetectionStrategy, Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';
import {CryptoApiService} from '../../services/crypto-api.service';
import {CoinMarketPrice} from '../../model/CoinMarketPrice';
import {forkJoin, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

interface IBinanceExport {
  UTC_Time: Date;
  Account: string;
  Operation: string;
  Coin: string;
  Change: string;
}

@Component({
  selector: 'app-invest-history',
  templateUrl: './invest-history.component.html',
  styleUrls: ['./invest-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestHistoryComponent {

  isLoading = true;
  investElements: InvestElement[];
  todayCoinsMarketPrices: Map<string, CoinMarketPrice> = new Map();

  constructor(private investService: InvestService, private cryptoService: CryptoApiService) {
    this.investService.getInvestElements().subscribe(investElements => {
      console.log('get new invest elements');
      this.isLoading = true;
      this.investElements = investElements;
      this.loadTodayCoinMarketPrices();
    });
  }

  showAddInvestModal(): void {
    this.investService.toggleAddInvestPopup(true);
  }

  showImportInvestModal(): void {
    this.investService.toggleImportInvestPopup(true);
  }

  calculateNetGain(investElement: InvestElement): number {
    console.log('calculate');
    const coinMarketPrice = this.todayCoinsMarketPrices.get(investElement.coinId);
    const pastValue = investElement.valueAcquired * investElement.conversionRate;
    const currentValue = investElement.valueAcquired * coinMarketPrice.market_data.current_price[investElement.sourceCurrency];
    return currentValue - pastValue;
  }

  calculateRateGain(investElement: InvestElement): number {
    const coinMarketPrice = this.todayCoinsMarketPrices.get(investElement.coinId);
    const pastValue = (investElement.valueAcquired * investElement.conversionRate);
    const currentValue = investElement.valueAcquired * coinMarketPrice.market_data.current_price[investElement.sourceCurrency];
    return ((currentValue - pastValue) / pastValue) * 100;
  }

  loadTodayCoinMarketPrices(): void {
    const distinctCoinIds = new Set(this.investElements.map(investElement => investElement.coinId));
    const coinPricesToFetch = new Array<Observable<CoinMarketPrice>>();
    for (const coinId of distinctCoinIds) {
      const coinPrice$ = this.cryptoService
        .fetchCoinPrice(coinId, new Date())
        .pipe(tap(coinPrice => this.todayCoinsMarketPrices.set(coinId, coinPrice)));
      coinPricesToFetch.push(coinPrice$);
    }
    forkJoin(coinPricesToFetch).subscribe(() => this.isLoading = false);
  }

  getLogoUrl(coinId: string): string {
    console.log('get logo url');
    return this.todayCoinsMarketPrices.get(coinId).image.small;
  }
}
