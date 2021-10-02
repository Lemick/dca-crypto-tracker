export interface CoinPrice {

  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      [fiatCode: string]: number;
    }
  };

}
