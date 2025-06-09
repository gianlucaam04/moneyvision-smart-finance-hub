import React, { createContext, useState, useContext, useEffect } from 'react';
import { Transaction, Category, SavingsGoal } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  savingsGoals: SavingsGoal[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyTrend: 'up' | 'down' | 'stable';
    budgetUsage: number;
  };
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Solo fetch dei dati quando l'utente è caricato e autenticato
    if (!isLoading && user) {
      fetchInitialData();
    }
  }, [user, isLoading]);

  const transformTransactionData = (data: any[]): Transaction[] => {
    return data.map(item => ({
      id: item.id,
      amount: item.amount,
      description: item.description,
      category: item.category,
      type: item.type as 'income' | 'expense',
      date: item.date,
      note: item.note || '',
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  };

  const transformCategoryData = (data: any[]): Category[] => {
    return data.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
      icon: item.icon,
      type: item.type as 'income' | 'expense' | 'both',
      budget: item.budget || 0
    }));
  };

  const transformGoalsData = (data: any[]): SavingsGoal[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      targetAmount: item.target_amount,
      currentAmount: item.current_amount,
      deadline: item.deadline,
      color: item.color,
      isCompleted: item.is_completed
    }));
  };

  const fetchInitialData = async () => {
    if (!user) return;

    try {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch savings goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      setTransactions(transformTransactionData(transactionsData || []));
      setCategories(transformCategoryData(categoriesData || []));
      setGoals(transformGoalsData(goalsData || []));

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const calculateSummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const budgetUsage = totalExpenses > 0 ? (totalExpenses / (totalIncome || 1)) * 100 : 0;

    let monthlyTrend: 'up' | 'down' | 'stable' = 'stable';
    if (balance > 0) monthlyTrend = 'up';
    else if (balance < 0) monthlyTrend = 'down';

    return {
      totalIncome,
      totalExpenses,
      balance,
      monthlyTrend,
      budgetUsage
    };
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const dbTransaction = {
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      note: transaction.note || '',
      user_id: user.id,
      id: uuidv4()
    };

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([dbTransaction]);

      if (error) throw error;

      const newTransaction: Transaction = {
        ...transaction,
        id: dbTransaction.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const dbUpdates: any = {};
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.note !== undefined) dbUpdates.note = updates.note;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('transactions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === id ? { 
            ...transaction, 
            ...updates,
            updatedAt: dbUpdates.updated_at
          } : transaction
        )
      );
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTransactions(prevTransactions =>
        prevTransactions.filter(transaction => transaction.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    const dbCategory = {
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
      budget: category.budget || null,
      user_id: user.id,
      id: uuidv4()
    };

    try {
      const { error } = await supabase
        .from('categories')
        .insert([dbCategory]);

      if (error) throw error;

      const newCategory: Category = {
        ...category,
        id: dbCategory.id
      };

      setCategories(prevCategories => [...prevCategories, newCategory]);
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === id ? { ...category, ...updates } : category
        )
      );
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCategories(prevCategories =>
        prevCategories.filter(category => category.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!user) return;

    const dbGoal = {
      title: goal.title,
      description: goal.description || '',
      target_amount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      color: goal.color,
      isCompleted: goal.isCompleted,
      user_id: user.id,
      id: uuidv4()
    };

    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert([dbGoal]);

      if (error) throw error;

      const newGoal: SavingsGoal = {
        ...goal,
        id: dbGoal.id
      };

      setGoals(prevGoals => [...prevGoals, newGoal]);
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('savings_goals')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === id ? { ...goal, ...updates } : goal
        )
      );
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setGoals(prevGoals =>
        prevGoals.filter(goal => goal.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const addSavingsGoal = addGoal;
  const editSavingsGoal = updateGoal;
  const deleteSavingsGoal = deleteGoal;
  const updateSavingsGoal = updateGoal;

  const refreshData = async () => {
    if (!user) return;
    
    try {
      // Ricarica transazioni
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Ricarica categorie
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Ricarica obiettivi
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Aggiorna gli stati
      setTransactions(transformTransactionData(transactionsData || []));
      setCategories(transformCategoryData(categoriesData || []));
      setGoals(transformGoalsData(goalsData || []));

      console.log('Dati ricaricati con successo');
    } catch (error) {
      console.error('Errore nel ricaricamento dei dati:', error);
    }
  };

  const summary = calculateSummary();

  const value = {
    transactions,
    categories,
    goals,
    savingsGoals: goals,
    summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    addSavingsGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    updateSavingsGoal,
    refreshData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
