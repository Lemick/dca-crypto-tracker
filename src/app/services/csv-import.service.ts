import {Injectable} from '@angular/core';
import {BinanceImportOperation, parseBinanceCsvLine} from '../model/BinanceImportOperation';
import * as csvToJson from 'csvtojson';
import {groupBy, sum} from '../utils/arrayUtils';
import {ImportInvestLine} from '../model/ImportInvestLine';
import {Observable} from 'rxjs';
import {MarketCurrency} from '../model/enum/MarketCurrency';

@Injectable({
  providedIn: 'root'
})
export class CsvImportService {

  constructor() {
  }

  importBinanceCsv(text: string): Observable<ImportInvestLine[]> {
    return new Observable<ImportInvestLine[]>(subscriber => {
      const csvBinanceOperations = new Array<BinanceImportOperation>();
      csvToJson().fromString(text).subscribe((data, lineNumber) => {
          const parsedLine = parseBinanceCsvLine(data);
          if (parsedLine.Operation !== 'Deposit') {
            csvBinanceOperations.push(parseBinanceCsvLine(data));
          }
        },
        err => subscriber.error(err),
        () => {
          subscriber.next(this.convertToimportInvestLine(csvBinanceOperations));
          subscriber.complete();
        }
      );
    });
  }

  private convertToimportInvestLine(operations: BinanceImportOperation[]): ImportInvestLine[] {
    return Array.from(groupBy(operations, e => e.UTC_Time.getTime()).values())
      .map(timeGroupedOperations => groupBy(timeGroupedOperations, e => e.Coin))
      .filter(currencyGroupedOperations => currencyGroupedOperations.size === 2)
      .map((currencyGroupedOperations, index) => this.extractimportInvestLine(currencyGroupedOperations, index));
  }

  private extractimportInvestLine(currencyGroupedOperations: Map<MarketCurrency, BinanceImportOperation[]>, index: number): ImportInvestLine {
    const importInvestLine = {id: index} as ImportInvestLine;
    currencyGroupedOperations.forEach((value, keyCoin) => {
      const changeTotal = sum(value, e => e.Change);
      importInvestLine.investDate = value[0].UTC_Time;
      if (changeTotal > 0) {
        importInvestLine.valueAcquired = changeTotal;
        importInvestLine.toCurrency = keyCoin;
      } else {
        importInvestLine.valueSpent = changeTotal;
        importInvestLine.fromCurrency = keyCoin;
      }
    });
    console.log('generated import invest', importInvestLine);
    return importInvestLine;
  }

}
