import React, { createContext, useState, useContext, useEffect } from 'react';
import { Transaction, Category, SavingsGoal } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

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

      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);
      setGoals(goalsData || []);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const newTransaction = { ...transaction, user_id: user.id, id: uuidv4() };

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([newTransaction]);

      if (error) throw error;

      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
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

    const newCategory = { ...category, user_id: user.id, id: uuidv4() };

    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);

      if (error) throw error;

      setCategories(prevCategories => [...prevCategories, newCategory]);
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
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

    const newGoal = { ...goal, user_id: user.id, id: uuidv4() };

    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert([newGoal]);

      if (error) throw error;

      setGoals(prevGoals => [...prevGoals, newGoal]);
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .update(updates)
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
      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);
      setGoals(goalsData || []);

      console.log('Dati ricaricati con successo');
    } catch (error) {
      console.error('Errore nel ricaricamento dei dati:', error);
    }
  };

  const value = {
    transactions,
    categories,
    goals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshData // Aggiungo il nuovo metodo
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
