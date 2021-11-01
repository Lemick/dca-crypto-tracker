import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {formatDate} from '@angular/common';
import {CoinMarketPrice} from '../model/CoinMarketPrice';
import {MarketCoinInfos} from '../model/MarketCoinInfos';
import {shareReplay, tap} from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CryptoApiService {

  readonly LOCAL_STORAGE_CACHE_COIN_KEY = 'marketDataCache';
  readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  coinDataCache: { [key: string]: CoinMarketPrice } = {};
  readonly popularMarketCoins$ = this.fetchPopularMarketCoins().pipe(shareReplay(1));

  constructor(private httpClient: HttpClient) {
    if (localStorage.getItem(this.LOCAL_STORAGE_CACHE_COIN_KEY)) {
      this.coinDataCache = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_CACHE_COIN_KEY));
    }
  }

  fetchCoinInfo(coinId: string): Observable<object> {
    const params = new HttpParams()
      .set('localization', String(false))
      .set('tickers', String(false))
      .set('market_data', String(false))
      .set('community_data', String(false))
      .set('developer_data', String(false))
      .set('sparkline', String(false));

    return this.httpClient.get<object>(this.BASE_URL + '/coins/' + coinId, {params});
  }

  fetchCoinPrice(coinId: string, date: Date): Observable<CoinMarketPrice> {
    const cacheKey = `${coinId}_${date.getUTCDate()}_${date.getUTCMonth()}_${date.getUTCFullYear()}`;
    if (this.coinDataCache[cacheKey]) {
      return of(this.coinDataCache[cacheKey]);
    } else {
      const params = new HttpParams()
        .set('localization', String(false))
        .set('date', moment(date).format('DD-MM-YYYY'));

      return this.httpClient
        .get<CoinMarketPrice>(this.BASE_URL + '/coins/' + coinId + '/history', {params})
        .pipe(tap(coinPrice => this.addCoinPriceCacheValue(cacheKey, coinPrice)));
    }
  }

  private addCoinPriceCacheValue(cacheKey: string, coinPrice: CoinMarketPrice): void {
    this.coinDataCache[cacheKey] = coinPrice;
    localStorage.setItem(this.LOCAL_STORAGE_CACHE_COIN_KEY, JSON.stringify(this.coinDataCache));
  }

  private fetchPopularMarketCoins(): Observable<MarketCoinInfos[]> {
    const params = new HttpParams()
      .set('vs_currency', 'eur')
      .set('order', 'market_cap_desc')
      .set('per_page', String(250))
      .set('page', String(1));

    return this.httpClient.get<MarketCoinInfos[]>(this.BASE_URL + '/coins/markets', {params});
  }
}
