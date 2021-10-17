import {Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';
import {CryptoApiService} from '../../services/crypto-api.service';
import {CoinMarketPrice} from '../../model/CoinMarketPrice';
import {forkJoin, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NzTableFilterList} from 'ng-zorro-antd/table';
import {filterDuplicates} from '../../utils/arrayUtils';

interface InvestElementGain {
  gainValue: number;
  gainRate: number;
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
      name: 'Date de l investissement',
      sortOrder: 'descend',
      sortFn: (a: InvestElement, b: InvestElement) => a.investDate.getTime() - b.investDate.getTime(),
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Cryptomonnaie',
      sortFn: (a: InvestElement, b: InvestElement) => a.coinId.localeCompare(b.coinId),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: false,
      filterFn: (coinId: string, item: InvestElement) => item.coinId === coinId
    },
    {
      name: 'Valeur echangée',
      sortFn: (a: InvestElement, b: InvestElement) => a.valueAcquired - b.valueAcquired,
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Valeur d\'achat',
      sortFn: (a: InvestElement, b: InvestElement) => a.conversionRate - b.conversionRate,
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Gain net'
    },
    {
      name: 'Gain %'
    }
  ];

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
      this.updateCoinFilterList();
      this.isLoading = false;
      this.investElements = investElements;
    });
  }

  deleteRow(elementToRemove: InvestElement): void {
    this.investService.removeInvestElement(elementToRemove);
  }

  private updateCoinFilterList(): void {
    const listOfFilters = filterDuplicates(
      Array.from(this.todayCoinsMarketPrices.values()),
      (a, b) => a.id !== b.id
    ).map(coin => ({text: coin.name, value: coin.id}));

    this.headers.find(header => header.name === 'Cryptomonnaie').listOfFilters = listOfFilters; // TODO enum ID
  }

}
