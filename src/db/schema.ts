
import type { Json } from '@/integrations/supabase/types';

// 📦 profiles table
export type Profile = {
  id: string;
  email: string;
  name: string;
  preferences: Json;
  created_at: string;
  updated_at: string;
};

// 📦 categories table
export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  budget: number | null;
  created_at: string;
  updated_at: string;
};

// 📦 transactions table
export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  note: string | null;
  type: string;
  created_at: string;
  updated_at: string;
};

// 📦 savings_goals table
export type SavingsGoal = {
  id: string;
  user_id: string;
  color: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

// 📦 investments table
export type Investment = {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  isin: string | null;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price: number | null;
  change_percent: number | null;
  // PAC/DCA fields (optional)
  dca_enabled: boolean | null;
  dca_amount: number | null;
  dca_start_date: string | null;
  dca_day_of_month: number | null;
  next_reminder_at: string | null;
  last_reminded_at: string | null;
  dca_history: Json | null; // stored as JSONB array
  created_at: string;
  updated_at: string;
};

// 📦 archives table
export type Archive = {
  id: string;
  user_id: string;
  file_name: string;
  file_data: Json;
  archive_type: 'auto_archive' | 'import_archive';
  date_range_start: string;
  date_range_end: string;
  created_at: string;
  updated_at: string;
};

// Aggregated DB schema object - using the actual type definitions
export const DbSchema = {
  Profile: {} as Profile,
  Category: {} as Category,
  Transaction: {} as Transaction,
  SavingsGoal: {} as SavingsGoal,
  Investment: {} as Investment,
  Archive: {} as Archive,
} as const;
