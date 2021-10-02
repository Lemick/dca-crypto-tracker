import {MarketCurrency} from './enum/MarketCurrency';

export interface InvestElement {

  dateInvest: Date;
  coinId: string;
  sourceCurrency: MarketCurrency;
  cryptoValue: number;
  conversionRate: number; // Manuel ou auto
  coinLogoUrl: string;
}
