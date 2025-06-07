
export interface Investment {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  change_percent?: number;
  updated_at: string;
  created_at: string;
}

export interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface InvestmentFormData {
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
}
