import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {formatDate} from '@angular/common';
import {CoinPrice} from '../model/CoinPrice';
import {MarketCoin} from '../model/MarketCoin';

@Injectable({
  providedIn: 'root'
})
export class CryptoApiService {

  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly currentMarketCoinsSubject = new Subject();

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

  fetchCoinPrice(coinId: string, date: Date): Observable<CoinPrice> {
    console.log('locale', formatDate(date, 'dd-MM-yyyy', 'en-US'));
    const params = new HttpParams()
      .set('localization', String(false))
      .set('date', formatDate(date, 'dd-MM-yyyy', 'en-US'))
      .set('id', coinId);

    return this.httpClient.get<CoinPrice>(this.baseUrl + '/coins/' + coinId + '/history', {params});
  }

  initCurrentMarketCoinsObservable(): Observable<MarketCoin[]> {
    const params = new HttpParams()
      .set('vs_currency', 'eur')
      .set('order', 'market_cap_desc')
      .set('per_page', String(250))
      .set('page', String(1));

    return this.httpClient.get<MarketCoin[]>(this.baseUrl + '/coins/markets', {params});
  }

  fetchMarketCoins(): Observable<MarketCoin[]> {
    const params = new HttpParams()
      .set('vs_currency', 'eur')
      .set('order', 'market_cap_desc')
      .set('per_page', String(250))
      .set('page', String(1));

    return this.httpClient.get<MarketCoin[]>(this.baseUrl + '/coins/markets', {params});
  }

  fetchCoins(): Observable<MarketCoin[]> {
    const params = new HttpParams()
      .set('vs_currency', 'eur')
      .set('order', 'market_cap_desc')
      .set('per_page', String(250))
      .set('page', String(1));

    return this.httpClient.get<MarketCoin[]>(this.baseUrl + '/coins/markets', {params});
  }
}