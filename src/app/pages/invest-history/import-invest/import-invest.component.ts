import {Component, OnInit} from '@angular/core';
import {CsvImportService} from '../../../services/csv-import.service';
import {InvestService} from '../../../services/invest.service';
import {NzUploadFile} from 'ng-zorro-antd/upload/interface';
import {calculateConversionRate, ImportInvestLine} from '../../../model/ImportInvestLine';
import {InvestElement} from '../../../model/InvestElement';
import {CryptoApiService} from '../../../services/crypto-api.service';
import {MarketCoinInfos} from '../../../model/MarketCoinInfos';

@Component({
  selector: 'app-import-invest',
  templateUrl: './import-invest.component.html',
  styleUrls: ['./import-invest.component.css']
})
export class ImportInvestComponent implements OnInit {

  isVisible: boolean;
  importInvestLines: ImportInvestLine[] = [];
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
    this.importInvestLines
      .filter(importInvestLine => this.setOfCheckedId.has(importInvestLine.id))
      .forEach(importInvestLine => {
        const investElement = this.convertImportLineToInvest(importInvestLine);
        this.investService.addInvestElement(investElement);
      });
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
    this.importInvestLines.forEach(({id}) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.allCheckedState = this.importInvestLines.every(({id}) => this.setOfCheckedId.has(id));
    this.intermediateCheckState = this.importInvestLines.some(({id}) => this.setOfCheckedId.has(id)) && !this.allCheckedState;
  }

  private _uploadLocalFile(file: NzUploadFile, fileList: NzUploadFile[]): boolean {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      this.setOfCheckedId = new Set();
      this.csvImportService.importBinanceCsv(fileReader.result as string).subscribe(
        elements => this.importInvestLines = elements,
        error => console.error(error));
    };
    fileReader.readAsText(file as any);
    return false;
  }
}
