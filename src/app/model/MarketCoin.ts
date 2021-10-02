export interface MarketCoin {

  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_h: number;
  low_h: number;
  price_change_h: number;
  price_change_percentage_h: number;
  market_cap_change_h: number;
  market_cap_change_percentage_h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: Date;
  atl: number;
  atl_change_percentage: number;
  atl_date: Date;
  last_updated: Date;
}
