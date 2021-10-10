import {Injectable} from '@angular/core';
import {BinanceImportOperation, parseBinanceCsvLine} from '../model/BinanceImportOperation';
import * as csvToJson from 'csvtojson';
import {groupBy, sum} from '../utils/functionalUtils';
import {ImportInvestElement} from '../model/ImportInvestElement';
import {Observable} from 'rxjs';
import {MarketCurrency} from '../model/enum/MarketCurrency';

@Injectable({
  providedIn: 'root'
})
export class CsvImportService {

  constructor() {
  }

  importBinanceCsv(text: string): Observable<ImportInvestElement[]> {
    return new Observable<ImportInvestElement[]>(subscriber => {
      const operations = new Array<BinanceImportOperation>();
      csvToJson().fromString(text).subscribe((data, lineNumber) => {
          console.log(data);
          operations.push(parseBinanceCsvLine(data));
        },
        err => subscriber.error(err),
        () => {
          subscriber.next(this.convertToImportInvestElement(operations));
          subscriber.complete();
        }
      );
    });
  }

  private convertToImportInvestElement(operations: BinanceImportOperation[]): ImportInvestElement[] {
    operations = operations.filter(value => value.Operation !== 'Deposit');
    return Array.from(groupBy(operations, e => e.UTC_Time.getTime()).values())
      .filter(timeGroupedOperations => timeGroupedOperations.length > 1)
      .map(timeGroupedOperations => groupBy(timeGroupedOperations, e => e.Coin))
      .filter(currencyGroupedOperations => currencyGroupedOperations.size === 2)
      .map((currencyGroupedOperations, index) => this.extractImportInvestElement(currencyGroupedOperations, index));
  }

  private extractImportInvestElement(currencyGroupedOperations: Map<MarketCurrency, BinanceImportOperation[]>, index: number): ImportInvestElement {
    const importInvestElement = {id: index} as ImportInvestElement;
    currencyGroupedOperations.forEach((value, keyCoin) => {
      const changeTotal = sum(value, e => e.Change);
      importInvestElement.investDate = value[0].UTC_Time;
      if (changeTotal > 0) {
        importInvestElement.valueAcquired = changeTotal;
        importInvestElement.fromCurrency = keyCoin;
      } else {
        importInvestElement.valueSpent = changeTotal;
        importInvestElement.toCurrency = keyCoin;
      }
    });
    console.log('generated import invest', importInvestElement);
    return importInvestElement;
  }

}
