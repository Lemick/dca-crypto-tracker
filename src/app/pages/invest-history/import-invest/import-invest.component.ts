import {Component, OnInit} from '@angular/core';
import {CsvImportService} from '../../../services/csv-import.service';
import {InvestService} from '../../../services/invest.service';
import {NzUploadFile} from 'ng-zorro-antd/upload/interface';
import {calculateConversionRate, ImportInvestLine} from '../../../model/ImportInvestLine';
import {InvestElement} from '../../../model/InvestElement';
import {CryptoApiService} from '../../../services/crypto-api.service';
import {MarketCoinInfos} from '../../../model/MarketCoinInfos';
import {MarketCurrency} from '../../../model/enum/MarketCurrency';

interface TableImportLine {
  enabled: boolean;
  importedLine: ImportInvestLine;
}

@Component({
  selector: 'app-import-invest',
  templateUrl: './import-invest.component.html',
  styleUrls: ['./import-invest.component.css']
})
export class ImportInvestComponent implements OnInit {

  isVisible: boolean;
  importInvestLines: TableImportLine[] = [];
  uploadLocalFile = this._uploadLocalFile.bind(this);

  allCheckedState = false;
  intermediateCheckState = false;
  setOfCheckedId = new Set<number>();
  availableCoins: MarketCoinInfos[];

  constructor(private investService: InvestService, private cryptoService: CryptoApiService, private csvImportService: CsvImportService) {
    this.investService.getImportInvestPopupChanges().subscribe(value => this.isVisible = value);
    this.cryptoService.popularMarketCoins$.subscribe(value => this.availableCoins = value);
  }

  ngOnInit(): void {
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  handleOk(): void {
    this.isVisible = false;
    const importedInvestElements = this.importInvestLines
      .filter(tableLine => this.setOfCheckedId.has(tableLine.importedLine.id))
      .map(tableLine => this.convertImportLineToInvest(tableLine.importedLine));
    this.investService.addInvestElements(...importedInvestElements);
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.importInvestLines
      .filter(tableLine => tableLine.enabled)
      .forEach(tableLine => this.updateCheckedSet(tableLine.importedLine.id, checked));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.allCheckedState = this.importInvestLines.every(tableLine => this.setOfCheckedId.has(tableLine.importedLine.id));
    this.intermediateCheckState = this.importInvestLines.some(tableLine => this.setOfCheckedId.has(tableLine.importedLine.id)) && !this.allCheckedState;
  }

  private _uploadLocalFile(file: NzUploadFile, fileList: NzUploadFile[]): boolean {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      this.setOfCheckedId = new Set();
      this.csvImportService.importBinanceCsv(fileReader.result as string).subscribe(
        elements => {
          this.importInvestLines = elements.map(importedLine => ({
            enabled: this.isDestinationCurrencySupported(importedLine.toCurrency),
            importedLine
          } as TableImportLine));
        },
        error => console.error(error));
    };
    fileReader.readAsText(file as any);
    return false;
  }

  private isDestinationCurrencySupported(destinationCurrency: string): boolean {
    return this.availableCoins.some(marketCoin => marketCoin.symbol.toLowerCase() === destinationCurrency.toLowerCase());
  }

  private convertImportLineToInvest(importInvestLine: ImportInvestLine): InvestElement {
    const sourceCoinInfos = this.availableCoins.find(marketCoin => marketCoin.symbol.toLowerCase() === importInvestLine.toCurrency.toLowerCase());
    return {
      investDate: importInvestLine.investDate,
      sourceCurrency: importInvestLine.fromCurrency.toLowerCase(),
      coinId: sourceCoinInfos.id,
      valueAcquired: importInvestLine.valueAcquired,
      conversionRate: calculateConversionRate(importInvestLine)
    } as InvestElement;
  }
}
