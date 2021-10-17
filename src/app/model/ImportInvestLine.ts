import {MarketCurrency} from './enum/MarketCurrency';

export interface ImportInvestLine {
  id: number;
  investDate: Date;
  fromCurrency: string;
  valueSpent: number;
  toCurrency: string;
  valueAcquired: number;
}

export function calculateConversionRate(importInvestLine: ImportInvestLine): number {
  return Math.abs(importInvestLine.valueSpent) / Math.abs(importInvestLine.valueAcquired);
}
