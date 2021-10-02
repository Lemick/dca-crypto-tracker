import {Component, OnInit} from '@angular/core';
import {MarketCurrency} from '../../../model/enum/MarketCurrency';
import {MarketCoin} from '../../../model/MarketCoin';
import {CryptoService} from '../../../services/crypto.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InvestElement} from '../../../model/InvestElement';
import {Coin} from '../../../model/Coin';
import {InvestService} from '../../../services/invest.service';
import {noFutureDateValidator} from '../../../utils/validators';

@Component({
  selector: 'app-add-invest',
  templateUrl: './add-invest.component.html',
  styleUrls: ['./add-invest.component.css']
})
export class AddInvestComponent implements OnInit {

  validateForm: FormGroup;
  isVisible: boolean;
  marketCurrencies = Object.keys(MarketCurrency);

  availableCoins: MarketCoin[];
  selectedCoinInfo: object = null;

  selectedDate: Date;
  selectedCoin: MarketCoin;
  selectedCryptoValue: number;
  selectedSourceCurrency: MarketCurrency;
  selectedConversionRate: number;

  investElement: InvestElement = null;
  investElementInFetching = false;

  constructor(private investService: InvestService,
              private cryptoService: CryptoService,
              private fb: FormBuilder) {
    cryptoService.fetchMarketCoins().subscribe(value => this.availableCoins = value);
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      coinCtrl: [null, [Validators.required]],
      investDateCtrl: [null, [Validators.required, noFutureDateValidator()]],
      valueBoughtCtrl: [null, [Validators.required]],
      sourceCurrencyCtrl: [null, [Validators.required]],
      conversionRateCtrl: [null, [Validators.required]],
    });
    this.investService.getInvestPopupChanges().subscribe(value => this.isVisible = value);
  }

  doesCoinSettingsAreValid(): boolean {
    return this.validateForm.controls.coinCtrl.valid
      && this.validateForm.controls.investDateCtrl.valid
      && this.validateForm.controls.sourceCurrencyCtrl.valid;
  }

  handleOk(): void {
    this.investService.addInvestElement(this.investElement);
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  changeSelectedCoin($event: Coin): void {
    if ($event) {
      this.selectedCoinInfo = null;
      this.cryptoService.fetchCoinInfo($event.id).subscribe(value => {
        this.selectedCoinInfo = value;
        if (this.doesCoinSettingsAreValid()) {
          this.investElementInFetching = true;
          this.updateInvestElement();
        }
      });
    }
  }

  changeInvestDate($event: Date): void {
    if ($event && this.doesCoinSettingsAreValid()) {
      this.investElementInFetching = true;
      this.updateInvestElement();
    }
  }

  changeMarketCurrency($event: MarketCurrency): void {
    if ($event && this.doesCoinSettingsAreValid()) {
      this.investElementInFetching = true;
      this.updateInvestElement();
    }
  }

  updateInvestElement(): void {
    this.cryptoService
      .fetchCoinPrice(this.selectedCoin.id, this.selectedDate)
      .subscribe(responseCoinPrice => {
        console.log('price=', responseCoinPrice, this.selectedSourceCurrency);

        this.investElement = {
          coinId: this.selectedCoin.id,
          dateInvest: this.selectedDate,
          sourceCurrency: this.selectedSourceCurrency,
          coinLogoUrl: (this.selectedCoinInfo as any).image?.thumb,
          cryptoValue: this.selectedCryptoValue,
          conversionRate: responseCoinPrice.market_data.current_price[this.selectedSourceCurrency]
        };
        this.validateForm.controls.conversionRateCtrl.setValue(this.investElement.conversionRate);
        this.investElementInFetching = false;
      });
  }

}

