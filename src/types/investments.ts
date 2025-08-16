
export interface Investment {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  isin?: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  change_percent?: number;
  // PAC/DCA support
  dca_enabled?: boolean;
  dca_amount?: number | null;
  dca_start_date?: string | null;
  dca_day_of_month?: number | null;
  next_reminder_at?: string | null;
  last_reminded_at?: string | null;
  dca_history?: DcaHistoryEntry[] | null;
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
  isin?: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  // Optional PAC fields captured on creation
  dca_enabled?: boolean;
  dca_amount?: number | null;
  dca_start_date?: string | null;
  dca_day_of_month?: number | null;
}

export interface DcaHistoryEntry {
  date: string;          // ISO date of contribution
  amount: number;        // total cash invested in this contribution
  price: number;         // unit price used
  quantity: number;      // derived amount/price
  note?: string;
}
