import {MarketCurrency} from './enum/MarketCurrency';

export interface ImportInvestElement {
  id: number;
  investDate: Date;
  fromCurrency: MarketCurrency;
  valueSpent: number;
  toCurrency: MarketCurrency;
  valueAcquired: number;
}
