
export interface CoinMarketPrice {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
  };
  market_data: {
    current_price: {
      [fiatCode: string]: number;
    }
  };
}

