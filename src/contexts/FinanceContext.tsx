import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, SavingsGoal, FinancialSummary } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  editSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;
  refreshSummary: () => void;
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// Default categories for new users
const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Stipendio', color: '#10B981', icon: 'circle-dollar-sign', type: 'income' },
  { name: 'Alimentari', color: '#F59E0B', icon: 'circle-minus', type: 'expense', budget: 400 },
  { name: 'Trasporti', color: '#EF4444', icon: 'circle-minus', type: 'expense', budget: 200 },
  { name: 'Intrattenimento', color: '#8B5CF6', icon: 'circle-minus', type: 'expense', budget: 150 },
];

// Mapping functions to convert database types to interface types
const mapDbCategory = (dbCategory: any): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  color: dbCategory.color,
  icon: dbCategory.icon,
  type: dbCategory.type as 'income' | 'expense' | 'both',
  budget: dbCategory.budget || undefined
});

const mapDbTransaction = (dbTransaction: any): Transaction => ({
  id: dbTransaction.id,
  amount: Number(dbTransaction.amount),
  description: dbTransaction.description,
  category: dbTransaction.category,
  type: dbTransaction.type as 'income' | 'expense',
  date: dbTransaction.date,
  note: dbTransaction.note || undefined,
  createdAt: dbTransaction.created_at,
  updatedAt: dbTransaction.updated_at
});

const mapDbSavingsGoal = (dbGoal: any): SavingsGoal => ({
  id: dbGoal.id,
  title: dbGoal.title,
  targetAmount: Number(dbGoal.target_amount),
  currentAmount: Number(dbGoal.current_amount),
  deadline: dbGoal.deadline || undefined,
  color: dbGoal.color,
  description: dbGoal.description || undefined,
  isCompleted: dbGoal.is_completed
});

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyTrend: 'stable',
    budgetUsage: 0
  });

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setTransactions([]);
      setCategories([]);
      setSavingsGoals([]);
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else {
        // If no categories exist, create default ones
        if (categoriesData.length === 0) {
          await createDefaultCategories();
        } else {
          setCategories(categoriesData.map(mapDbCategory));
        }
      }

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
      } else {
        setTransactions((transactionsData || []).map(mapDbTransaction));
      }

      // Load savings goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
      } else {
        setSavingsGoals((goalsData || []).map(mapDbSavingsGoal));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    if (!user) return;

    try {
      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (error) {
        console.error('Error creating default categories:', error);
      } else {
        setCategories((data || []).map(mapDbCategory));
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

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
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = Math.abs(monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0));

    const balance = totalIncome - totalExpenses;
    
    const totalBudget = categories
      .filter(c => c.budget)
      .reduce((sum, c) => sum + Number(c.budget || 0), 0);
    
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

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere la transazione",
          variant: "destructive",
        });
        return;
      }

      setTransactions(prev => [mapDbTransaction(data), ...prev]);
      toast({
        title: "Successo",
        description: "Transazione aggiunta con successo",
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare la transazione",
          variant: "destructive",
        });
        return;
      }

      setTransactions(prev => prev.map(t => t.id === id ? mapDbTransaction(data) : t));
      toast({
        title: "Successo",
        description: "Transazione aggiornata con successo",
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare la transazione",
          variant: "destructive",
        });
        return;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Successo",
        description: "Transazione eliminata con successo",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere la categoria",
          variant: "destructive",
        });
        return;
      }

      setCategories(prev => [...prev, mapDbCategory(data)]);
      toast({
        title: "Successo",
        description: "Categoria aggiunta con successo",
      });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare la categoria",
          variant: "destructive",
        });
        return;
      }

      setCategories(prev => prev.map(c => c.id === id ? mapDbCategory(data) : c));
      toast({
        title: "Successo",
        description: "Categoria aggiornata con successo",
      });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare la categoria",
          variant: "destructive",
        });
        return;
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Successo",
        description: "Categoria eliminata con successo",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id'>) => {
    if (!user) return;

    try {
      const dbGoalData = {
        title: goalData.title,
        target_amount: goalData.targetAmount,
        current_amount: goalData.currentAmount || 0,
        deadline: goalData.deadline || null,
        color: goalData.color,
        description: goalData.description || null,
        is_completed: goalData.isCompleted || false,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .insert(dbGoalData)
        .select()
        .single();

      if (error) {
        console.error('Error adding goal:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere l'obiettivo",
          variant: "destructive",
        });
        return;
      }

      setSavingsGoals(prev => [...prev, mapDbSavingsGoal(data)]);
      toast({
        title: "Successo",
        description: "Obiettivo aggiunto con successo",
      });
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const editSavingsGoal = async (goalData: SavingsGoal) => {
    if (!user) return;

    try {
      const updatePayload = {
        title: goalData.title,
        target_amount: goalData.targetAmount,
        deadline: goalData.deadline || null,
        description: goalData.description || null,
        color: goalData.color,
        is_completed: goalData.currentAmount >= goalData.targetAmount
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .update(updatePayload)
        .eq('id', goalData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSavingsGoals(prev => prev.map(g => g.id === data.id ? mapDbSavingsGoal(data) : g));
      toast({ title: 'Successo', description: `Obiettivo "${goalData.title}" aggiornato con successo` });
    } catch (error) {
      console.error('Error editing goal:', error);
      toast({ title: 'Errore', description: 'Impossibile aggiornare l\'obiettivo', variant: 'destructive' });
    }
  };

  const updateSavingsGoal = async (id: string, amount: number) => {
    if (!user) return;

    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return;

    const newAmount = Math.min(amount, Number(goal.targetAmount));
    const isCompleted = newAmount >= Number(goal.targetAmount);

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: newAmount,
          is_completed: isCompleted
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare l'obiettivo",
          variant: "destructive",
        });
        return;
      }

      setSavingsGoals(prev => prev.map(g => g.id === id ? mapDbSavingsGoal(data) : g));
      toast({
        title: "Successo",
        description: "Obiettivo aggiornato con successo",
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavingsGoals(prev => prev.filter(g => g.id !== id));
      toast({ title: 'Successo', description: 'Obiettivo eliminato con successo' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({ title: 'Errore', description: 'Impossibile eliminare l\'obiettivo', variant: 'destructive' });
    }
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
    editSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    refreshSummary: calculateSummary,
    isLoading
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
