import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, SavingsGoal, FinancialSummary } from '@/types';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  summary: FinancialSummary;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  refreshSummary: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// Dati demo iniziali
const initialCategories: Category[] = [
  { id: '1', name: 'Stipendio', color: '#10B981', icon: 'circle-dollar-sign', type: 'income' },
  { id: '2', name: 'Alimentari', color: '#F59E0B', icon: 'circle-minus', type: 'expense', budget: 400 },
  { id: '3', name: 'Trasporti', color: '#EF4444', icon: 'circle-minus', type: 'expense', budget: 200 },
  { id: '4', name: 'Intrattenimento', color: '#8B5CF6', icon: 'circle-minus', type: 'expense', budget: 150 },
];

const initialTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    description: 'Stipendio Marzo',
    category: 'Stipendio',
    type: 'income',
    date: '2024-03-01',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    amount: -85.50,
    description: 'Spesa supermercato',
    category: 'Alimentari',
    type: 'expense',
    date: '2024-03-02',
    note: 'Spesa settimanale',
    createdAt: '2024-03-02T14:30:00Z',
    updatedAt: '2024-03-02T14:30:00Z'
  },
  {
    id: '3',
    amount: -25.00,
    description: 'Abbonamento metro',
    category: 'Trasporti',
    type: 'expense',
    date: '2024-03-01',
    createdAt: '2024-03-01T08:15:00Z',
    updatedAt: '2024-03-01T08:15:00Z'
  }
];

const initialGoals: SavingsGoal[] = [
  {
    id: '1',
    title: 'Vacanza Estiva',
    targetAmount: 1500,
    currentAmount: 450,
    deadline: '2024-07-01',
    color: '#3B82F6',
    description: 'Viaggio in Grecia',
    isCompleted: false
  },
  {
    id: '2',
    title: 'Fondo Emergenza',
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: '2024-12-31',
    color: '#10B981',
    description: 'Fondo di sicurezza',
    isCompleted: false
  }
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialGoals);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyTrend: 'stable',
    budgetUsage: 0
  });

  const calculateSummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    const balance = totalIncome - totalExpenses;
    
    const totalBudget = categories
      .filter(c => c.budget)
      .reduce((sum, c) => sum + (c.budget || 0), 0);
    
    const budgetUsage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    setSummary({
      totalIncome,
      totalExpenses,
      balance,
      monthlyTrend: balance > 0 ? 'up' : balance < 0 ? 'down' : 'stable',
      budgetUsage
    });
  };

  useEffect(() => {
    calculateSummary();
  }, [transactions, categories]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: Date.now().toString()
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === id 
        ? { 
            ...goal, 
            currentAmount: Math.min(amount, goal.targetAmount),
            isCompleted: amount >= goal.targetAmount
          }
        : goal
    ));
  };

  const value = {
    transactions,
    categories,
    savingsGoals,
    summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addSavingsGoal,
    updateSavingsGoal,
    refreshSummary: calculateSummary
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
