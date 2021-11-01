import {TestBed} from '@angular/core/testing';
import {CryptoApiService} from './crypto-api.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {CoinMarketPrice} from '../model/CoinMarketPrice';

describe('CryptoApiService', () => {
  let cryptoService: CryptoApiService;
  let httpTestingController;

  let expectedCoinMarketPrice: CoinMarketPrice;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    cryptoService = TestBed.inject(CryptoApiService);
    cryptoService.coinDataCache = {};
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    expectedCoinMarketPrice = {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'btc',
      image: {
        thumb: 'thumb',
        small: 'small'
      },
      market_data: {
        current_price: {
          eur: 1000
        }
      },
    };
  });

  it('should be created', () => {
    expect(cryptoService).toBeTruthy();
  });

  it('should fetch coin price from API first, then from cache', () => {
    expect(Object.keys(cryptoService.coinDataCache).length).toEqual(0);
    const date = new Date(Date.UTC(2020, 0, 1, 12));
    cryptoService.fetchCoinPrice('bitcoin', date).subscribe(
      data => expect(data).toEqual(expectedCoinMarketPrice, 'should return expected coin data'), fail
    );

    const req = httpTestingController.expectOne('https://api.coingecko.com/api/v3/coins/bitcoin/history?localization=false&date=01-01-2020');
    expect(req.request.method).toEqual('GET');

    req.flush(expectedCoinMarketPrice);
    expect(Object.keys(cryptoService.coinDataCache).length).toEqual(1);
    // TODO localStorage spy

    cryptoService.fetchCoinPrice('bitcoin', date).subscribe(
      data => expect(data).toEqual(expectedCoinMarketPrice, 'should return expected coin data'), fail
    );
    httpTestingController.expectNone('https://api.coingecko.com/api/v3/coins/bitcoin/history?localization=false&date=01-01-2020');
  });

});
