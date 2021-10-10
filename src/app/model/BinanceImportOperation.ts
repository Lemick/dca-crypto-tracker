import {MarketCoin} from './MarketCoin';
import {MarketCurrency} from './enum/MarketCurrency';

export interface BinanceImportOperation {
  UTC_Time: Date;
  Account: string;
  Operation: string;
  Coin: MarketCurrency;
  Change: number;
  Remark: string;
}

export function parseBinanceCsvLine(csvLine: any): BinanceImportOperation {
  return {
    UTC_Time: new Date(csvLine.UTC_Time),
    Account: csvLine.Account,
    Operation: csvLine.Operation,
    Coin: csvLine.Coin,
    Change: Number(csvLine.Change),
    Remark: csvLine.Remark,
  };
}
