import {MarketCurrency} from './enum/MarketCurrency';

export interface ImportInvestLine {
  id: number;
  investDate: Date;
  fromCurrency: MarketCurrency;
  valueSpent: number;
  toCurrency: MarketCurrency;
  valueAcquired: number;
}

export function calculateConversionRate(importInvestLine: ImportInvestLine): number {
  return Math.abs(importInvestLine.valueSpent) / Math.abs(importInvestLine.valueAcquired);
}
