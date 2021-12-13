import {Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';
import {CryptoApiService} from '../../services/crypto-api.service';
import {CoinMarketPrice} from '../../model/CoinMarketPrice';
import {forkJoin, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NzTableFilterList} from 'ng-zorro-antd/table';
import {filterDuplicates} from '../../utils/arrayUtils';
import {CurrencyService} from '../../services/currency.service';
import {MarketCurrency} from '../../model/enum/MarketCurrency';

interface InvestElementGain {
  gainValue: number;
  gainRate: number;
  currency: MarketCurrency;
}

interface TableHeader {
  name: string;
  sortFn?;
  sortDirections?: ['ascend', 'descend', null];
  sortOrder?;
  filterFn?;
  filterMultiple?: boolean;
  listOfFilters?: NzTableFilterList;
}

@Component({
  selector: 'app-invest-history',
  templateUrl: './invest-history.component.html',
  styleUrls: ['./invest-history.component.css']
})
export class InvestHistoryComponent {

  readonly headers: TableHeader[] = [
    {
      name: 'Invest date',
      sortOrder: 'descend',
      sortFn: (a: InvestElement, b: InvestElement) => a.investDate.getTime() - b.investDate.getTime(),
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Crypto currency',
      sortFn: (a: InvestElement, b: InvestElement) => a.coinId.localeCompare(b.coinId),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: false,
      filterFn: (coinId: string, item: InvestElement) => item.coinId === coinId,
      listOfFilters: []
    },
    {
      name: 'Value exchanged',
      sortFn: (a: InvestElement, b: InvestElement) => a.valueAcquired - b.valueAcquired,
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Purchase value',
      sortFn: (a: InvestElement, b: InvestElement) => a.conversionRate - b.conversionRate,
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Net Gain'
    },
    {
      name: '% Gain'
    }
  ];

  aggregationMarketCurrency = MarketCurrency.eur;
  isLoading = false;
  currencyRates: Map<MarketCurrency, number> = new Map();
  investElements: InvestElement[] = [];
  todayCoinsMarketPrices: Map<string, CoinMarketPrice> = new Map();
  investElementsGains: Map<InvestElement, InvestElementGain> = new Map();
  totalGain = 0;

  constructor(private investService: InvestService, private cryptoService: CryptoApiService, private currencyApiService: CurrencyService) {
    this.investService.getInvestElements().subscribe(investElements => {
      this.isLoading = true;
      this.currencyApiService.popularMarketCoins$.subscribe(currencyRates => {
        this.currencyRates = currencyRates;
        this.loadInvestElementsMarketData(investElements);
      });
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
      gainRate: ((currentValue - pastValue) / pastValue) * 100,
      currency: investElement.sourceCurrency
    };
  }

  loadInvestElementsMarketData(investElements: InvestElement[]): void {
    const distinctCoinIds = new Set(investElements.map(investElement => investElement.coinId));
    if (distinctCoinIds.size === 0) {
      this.investElements = [];
      return;
    }
    const coinPricesToFetch = this.gatherCoinsToFetch(distinctCoinIds);
    forkJoin(coinPricesToFetch).subscribe(() => {
      investElements.forEach(investElement => {
        this.investElementsGains.set(investElement, this.calculateInvestGain(investElement));
      });
      this.updateCoinFilterList();
      this.refreshTotalGain();
      this.isLoading = false;
      this.investElements = investElements;
    });
  }

  private gatherCoinsToFetch(distinctCoinIds: Set<string>): Array<Observable<CoinMarketPrice>> {
    const coinPricesToFetch = new Array<Observable<CoinMarketPrice>>();
    for (const coinId of distinctCoinIds) {
      const coinPrice$ = this.cryptoService
        .fetchCoinPrice(coinId, new Date())
        .pipe(tap(coinPrice => this.todayCoinsMarketPrices.set(coinId, coinPrice)));
      coinPricesToFetch.push(coinPrice$);
    }
    return coinPricesToFetch;
  }

  deleteRow(elementToRemove: InvestElement): void {
    this.investService.removeInvestElement(elementToRemove);
  }

  private updateCoinFilterList(): void {
    const listOfFilters = filterDuplicates(
      Array.from(this.todayCoinsMarketPrices.values()),
      (a, b) => a.id !== b.id
    ).map(coin => ({text: coin.name, value: coin.id}));

    this.headers[1].listOfFilters = listOfFilters; // TODO enum ID
  }

  private refreshTotalGain(): void {
    this.totalGain = 0;
    this.investElementsGains.forEach(investElementGain => {
        this.totalGain += this.convertCurrency(investElementGain.gainValue, investElementGain.currency, this.aggregationMarketCurrency);
      }
    );
  }

  public convertCurrency(fromValue: number, sourceCurrency: MarketCurrency, destinationCurrency: MarketCurrency): number {
    const valueInUsd = (1 / this.currencyRates.get(sourceCurrency)) * fromValue;
    return valueInUsd * this.currencyRates.get(destinationCurrency);
  }
}
