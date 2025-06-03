
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
  type: 'income' | 'expense' | 'both';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  description?: string;
  isCompleted: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyTrend: 'up' | 'down' | 'stable';
  budgetUsage: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    notifications: boolean;
  };
}

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}
