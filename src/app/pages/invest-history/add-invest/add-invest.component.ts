import {Component, OnInit} from '@angular/core';
import {MarketCurrency} from '../../../model/enum/MarketCurrency';
import {CryptoApiService} from '../../../services/crypto-api.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InvestElement} from '../../../model/InvestElement';
import {InvestService} from '../../../services/invest.service';
import {noFutureDateValidator} from '../../../utils/validators';
import {MarketCoinInfos} from '../../../model/MarketCoinInfos';

@Component({
  selector: 'app-add-invest',
  templateUrl: './add-invest.component.html',
  styleUrls: ['./add-invest.component.css']
})
export class AddInvestComponent implements OnInit {

  validateForm: FormGroup;
  isVisible: boolean;
  marketCurrencies = Object.keys(MarketCurrency);

  availableCoins: MarketCoinInfos[];
  selectedCoinInfo: object = null;

  selectedDate: Date;
  selectedCoin: MarketCoinInfos;
  selectedValueExchanged: number;
  selectedSourceCurrency: MarketCurrency;
  selectedConversionRate: number;

  investElement: InvestElement = null;
  isFetchingCoinPrice = false;

  constructor(private investService: InvestService,
              private cryptoService: CryptoApiService,
              private fb: FormBuilder) {
    cryptoService.popularMarketCoins$.subscribe(value => this.availableCoins = value);
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
    this.investElement = {
      coinId: this.selectedCoin.id,
      investDate: this.selectedDate,
      sourceCurrency: this.selectedSourceCurrency,
      valueAcquired: this.selectedValueExchanged,
      conversionRate: this.selectedConversionRate
    };
    this.investService.addInvestElement(this.investElement);
    this.validateForm.reset();
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  changeSelectedCoin($event: MarketCoinInfos): void {
    if ($event) {
      this.selectedCoinInfo = $event;
      if (this.doesCoinSettingsAreValid()) {
        this.isFetchingCoinPrice = true;
        this.updateConversionRate();
      }
    }
  }

  changeInvestDate($event: Date): void {
    if ($event && this.doesCoinSettingsAreValid()) {
      this.isFetchingCoinPrice = true;
      this.updateConversionRate();
    }
  }

  changeMarketCurrency($event: MarketCurrency): void {
    if ($event && this.doesCoinSettingsAreValid()) {
      this.isFetchingCoinPrice = true;
      this.updateConversionRate();
    }
  }

  updateConversionRate(): void {
    this.cryptoService
      .fetchCoinPrice(this.selectedCoin.id, this.selectedDate)
      .subscribe(responseCoinPrice => {
        console.log('price=', responseCoinPrice, this.selectedSourceCurrency);
        const conversionRate = responseCoinPrice.market_data.current_price[this.selectedSourceCurrency];
        this.validateForm.controls.conversionRateCtrl.setValue(conversionRate);
        this.isFetchingCoinPrice = false;
      });
  }

}

