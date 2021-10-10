import {Component, OnInit} from '@angular/core';
import {CsvImportService} from '../../../services/csv-import.service';
import {InvestService} from '../../../services/invest.service';
import {NzUploadFile} from 'ng-zorro-antd/upload/interface';
import {ImportInvestElement} from '../../../model/ImportInvestElement';
import {InvestElement} from '../../../model/InvestElement';

@Component({
  selector: 'app-import-invest',
  templateUrl: './import-invest.component.html',
  styleUrls: ['./import-invest.component.css']
})
export class ImportInvestComponent implements OnInit {

  isVisible: boolean;
  importInvestElements: ImportInvestElement[] = [];
  uploadLocalFile = this._uploadLocalFile.bind(this);

  allCheckedState = false;
  intermediateCheckState = false;
  setOfCheckedId = new Set<number>();

  constructor(private investService: InvestService, private csvImportService: CsvImportService) {
    this.investService.getImportInvestPopupChanges().subscribe(value => this.isVisible = value);
  }

  ngOnInit(): void {
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  handleOk(): void {
    this.isVisible = false;
    this.importInvestElements.forEach(value => {
    });
  }

  private toInvestElement(importInvestElement: ImportInvestElement): InvestElement {
    return {
      coinId: '',
      conversionRate: 1,
      dateInvest: importInvestElement
    } as unknown as InvestElement;
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
    this.importInvestElements.forEach(({id}) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.allCheckedState = this.importInvestElements.every(({id}) => this.setOfCheckedId.has(id));
    this.intermediateCheckState = this.importInvestElements.some(({id}) => this.setOfCheckedId.has(id)) && !this.allCheckedState;
  }

  private _uploadLocalFile(file: NzUploadFile, fileList: NzUploadFile[]): boolean {
    console.log(this);
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      this.csvImportService.importBinanceCsv(fileReader.result as string).subscribe(
        elements => this.importInvestElements = elements,
        error => console.log('error', error));
    };
    fileReader.readAsText(file as any);
    return false;
  }
}
