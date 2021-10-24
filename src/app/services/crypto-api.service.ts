import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {formatDate} from '@angular/common';
import {CoinMarketPrice} from '../model/CoinMarketPrice';
import {MarketCoinInfos} from '../model/MarketCoinInfos';
import {shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CryptoApiService {

  readonly LOCAL_STORAGE_CACHE_COIN_KEY = 'marketDataCache';

  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private coinDataCache: { [key: string]: CoinMarketPrice} = {};

  readonly popularMarketCoins$ = this.fetchPopularMarketCoins().pipe(shareReplay(1));

  constructor(private httpClient: HttpClient) {
    if (localStorage.getItem(this.LOCAL_STORAGE_CACHE_COIN_KEY)) {
      this.coinDataCache = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_CACHE_COIN_KEY));
    }
  }

  fetchPrices(): Observable<any> {
    const params = new HttpParams()
      .set('date', '2020-03-21')
      .set('localization', String(false));

    return this.httpClient.get(this.baseUrl + '/coins/bitcoin', {params});
  }

  fetchCoinInfo(coinId: string): Observable<object> {
    const params = new HttpParams()
      .set('localization', String(false))
      .set('tickers', String(false))
      .set('market_data', String(false))
      .set('community_data', String(false))
      .set('developer_data', String(false))
      .set('sparkline', String(false));

    return this.httpClient.get<object>(this.baseUrl + '/coins/' + coinId, {params});
  }

  fetchCoinPrice(coinId: string, date: Date): Observable<CoinMarketPrice> {
    const cacheKey = `${coinId}_${date.getUTCDate()}_${date.getUTCMonth()}_${date.getUTCFullYear()}`;
    if (this.coinDataCache[cacheKey]) {
      console.log('fetch coin from cache', formatDate(date, 'dd-MM-yyyy', 'en-US'));
      return of(this.coinDataCache[cacheKey]);
    } else {
      console.log('fetch coin from API', formatDate(date, 'dd-MM-yyyy', 'en-US'));
      const params = new HttpParams()
        .set('localization', String(false))
        .set('date', formatDate(date, 'dd-MM-yyyy', 'en-US'));

      return this.httpClient
        .get<CoinMarketPrice>(this.baseUrl + '/coins/' + coinId + '/history', {params})
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

    return this.httpClient.get<MarketCoinInfos[]>(this.baseUrl + '/coins/markets', {params});
  }
}
