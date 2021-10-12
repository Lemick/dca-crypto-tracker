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

  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private todayCoinPriceCache = new Map<string, CoinMarketPrice>();

  readonly popularMarketCoins$ = this.fetchPopularMarketCoins().pipe(shareReplay(1));

  constructor(private httpClient: HttpClient) {
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
    if (this.todayCoinPriceCache.has(cacheKey)) {
      console.log('fetch coin from cache', formatDate(date, 'dd-MM-yyyy', 'en-US'));
      return of(this.todayCoinPriceCache.get(cacheKey));
    } else {
      console.log('fetch coin from API', formatDate(date, 'dd-MM-yyyy', 'en-US'));
      const params = new HttpParams()
        .set('localization', String(false))
        .set('date', formatDate(date, 'dd-MM-yyyy', 'en-US'))

      return this.httpClient
        .get<CoinMarketPrice>(this.baseUrl + '/coins/' + coinId + '/history', {params})
        .pipe(tap(coinPrice => this.todayCoinPriceCache.set(cacheKey, coinPrice)));
    }
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
