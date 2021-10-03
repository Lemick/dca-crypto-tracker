import {Component} from '@angular/core';
import {InvestElement} from '../../model/InvestElement';
import {InvestService} from '../../services/invest.service';
import {CryptoApiService} from '../../services/crypto-api.service';
import {MarketCoin} from '../../model/MarketCoin';
import {CoinPrice} from '../../model/CoinPrice';

@Component({
  selector: 'app-invest-history',
  templateUrl: './invest-history.component.html',
  styleUrls: ['./invest-history.component.css']
})
export class InvestHistoryComponent {

  isLoading = true;

  /**
   * faire un tableau associatif avec clé étant une paire coinID currency pour calculer les gains
   */
  marketCoins: MarketCoin[];
  investElements: InvestElement[];
  todayCoinsMarketPrices: Map<string, CoinPrice> = new Map();

  constructor(private investService: InvestService, private cryptoService: CryptoApiService) {
    this.investService.getInvestElements().subscribe(value => {
      this.investElements = value;
      this.refreshTodayCoinMarketPrices();
    });
  }

  showModal(): void {
    this.investService.toggleInvestPopup(true);
  }

  calculateGain(investElement: InvestElement): number {
    const coinMarketPrice = this.todayCoinsMarketPrices.get(investElement.coinId);
    const pastValue = investElement.cryptoValue * investElement.conversionRate;
    const currentValue = investElement.cryptoValue * coinMarketPrice.market_data.current_price[investElement.sourceCurrency];
    return pastValue - currentValue;
  }

  refreshTodayCoinMarketPrices(): void {
    this.isLoading = true;
    const distinctCoinIds = new Set(this.investElements
      .map(investElement => investElement.coinId)
      .filter(coinId => !this.todayCoinsMarketPrices.has(coinId))
    );
    for (const coinId of distinctCoinIds) {
      this.cryptoService.fetchCoinPrice(coinId, new Date())
        .subscribe(coinPrice => {
          this.todayCoinsMarketPrices.set(coinId, coinPrice);
          this.isLoading = false;
        });
    }
  }
}
