import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MarketCurrency} from '../model/enum/MarketCurrency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  readonly BASE_URL = 'https://v6.exchangerate-api.com/v6/4239112c2a944f96c0c6c8ae/latest/USD';

  readonly popularMarketCoins$ = this.fetchFiatCurrencyValues().pipe(shareReplay(1));

  constructor(private httpClient: HttpClient) {
  }

  private fetchFiatCurrencyValues(): Observable<Map<MarketCurrency, number>> {
    return this.httpClient.get<any>(this.BASE_URL, {})
      .pipe(map(value => {
        const rates = Object.entries(value.conversion_rates) as [string, number][];
        rates.forEach(entryArray => {
          entryArray[0] = MarketCurrency[entryArray[0].toLowerCase()];
        });

        return new Map(rates) as Map<MarketCurrency, number>;
      }));
  }
}
