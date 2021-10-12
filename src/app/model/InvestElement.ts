import {MarketCurrency} from './enum/MarketCurrency';

export interface InvestElement {
  investDate: Date;
  coinId: string;
  sourceCurrency: MarketCurrency;
  valueAcquired: number;
  conversionRate: number;
}
