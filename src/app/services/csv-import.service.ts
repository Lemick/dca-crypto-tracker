import {Injectable} from '@angular/core';
import {BinanceImportOperation, parseBinanceCsvLine} from '../model/BinanceImportOperation';
import * as csvToJson from 'csvtojson';
import {groupBy, sum} from '../utils/arrayUtils';
import {ImportInvestLine} from '../model/ImportInvestLine';
import {Observable} from 'rxjs';
import {MarketCurrency} from '../model/enum/MarketCurrency';

interface TimeGroupedOperations {
  minTime: number;
  maxTime: number;
  operations: BinanceImportOperation[];
}

interface OperationGroup {
  operations: Map<MarketCurrency, BinanceImportOperation[]>;
}

@Injectable({
  providedIn: 'root'
})
export class CsvImportService {

  readonly OPERATIONS_ACCEPTED_DELAY_MS = 4000;

  constructor() {
  }

  importBinanceCsv(text: string): Observable<ImportInvestLine[]> {
    return new Observable<ImportInvestLine[]>(subscriber => {
      const csvBinanceOperations = new Array<BinanceImportOperation>();
      csvToJson().fromString(text).subscribe((data) => {
          const parsedLine = parseBinanceCsvLine(data);
          if (parsedLine.Operation !== 'Deposit') {
            csvBinanceOperations.push(parseBinanceCsvLine(data));
          }
        },
        err => subscriber.error(err),
        () => {
          const timeGroupedOperations = this.groupOperationByTime(csvBinanceOperations);
          const importInvestLines = this.createInvestImportLines(timeGroupedOperations);
          subscriber.next(importInvestLines);
          subscriber.complete();
        }
      );
    });
  }

  private groupOperationByTime(operations: BinanceImportOperation[]): TimeGroupedOperations[] {
    let currentGroup: TimeGroupedOperations = null;
    const operationsGroup: TimeGroupedOperations[] = [];
    const sortedOperations = [...operations].sort((a, b) => a.UTC_Time.getTime() - b.UTC_Time.getTime());
    sortedOperations.forEach(operationLine => {
      if (currentGroup === null) {
        currentGroup = this.createGroup(operationLine);
      } else {
        if (operationLine.UTC_Time.getTime() >= currentGroup.minTime && operationLine.UTC_Time.getTime() <= currentGroup.maxTime) {
          currentGroup.operations = [...currentGroup.operations, operationLine];
        } else {
          operationsGroup.push(currentGroup);
          currentGroup = this.createGroup(operationLine);
        }
      }
    });
    return operationsGroup;
  }

  private createGroup(operationLine: BinanceImportOperation): TimeGroupedOperations {
    return {
      minTime: operationLine.UTC_Time.getTime(),
      maxTime: operationLine.UTC_Time.getTime() + this.OPERATIONS_ACCEPTED_DELAY_MS,
      operations: [operationLine]
    };
  }

  private createInvestImportLines(groupArray: TimeGroupedOperations[]): ImportInvestLine[] {
    return groupArray
      .map(timeGroupedOperations => groupBy(timeGroupedOperations.operations, e => e.Coin))
      .filter(currencyGroupedOperations => currencyGroupedOperations.size === 2)
      .map((currencyGroupedOperations, index) => this.extractImportInvestLine(currencyGroupedOperations, index));
  }

  private extractImportInvestLine(currencyGroupedOperations: Map<MarketCurrency, BinanceImportOperation[]>, index: number): ImportInvestLine {
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
