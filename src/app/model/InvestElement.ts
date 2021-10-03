import {MarketCurrency} from './enum/MarketCurrency';

export interface InvestElement {
  dateInvest: Date;
  coinId: string;
  sourceCurrency: MarketCurrency;
  valueExchanged: number;
  conversionRate: number;
  coinLogoUrl: string;
}
