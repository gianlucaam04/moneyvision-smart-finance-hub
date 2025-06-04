
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  exportData: () => Promise<boolean>;
  importData: (data: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        preferences: profile.preferences
      } as User;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          setUser(userProfile);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const updateUserPreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    try {
      const updatedPreferences = {
        ...user.preferences,
        ...preferences
      };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare le preferenze",
          variant: "destructive",
        });
        return;
      }

      const updatedUser = {
        ...user,
        preferences: updatedPreferences
      };
      
      setUser(updatedUser);
      
      // Apply theme immediately
      if (preferences.theme) {
        document.documentElement.classList.toggle('dark', 
          preferences.theme === 'dark' || 
          (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
      }

      toast({
        title: "Successo",
        description: "Preferenze aggiornate con successo",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };
  
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      toast({
        title: "Successo",
        description: "Password cambiata con successo",
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      setIsLoading(false);
      return false;
    }
  };
  
  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      // Delete user data will be handled by CASCADE in database
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        console.error('Account deletion error:', error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare l'account",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      await logout();
      toast({
        title: "Account eliminato",
        description: "Il tuo account è stato eliminato con successo",
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Account deletion error:', error);
      setIsLoading(false);
      return false;
    }
  };
  
  const exportData = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Fetch all user data from Supabase
      const [categoriesRes, transactionsRes, goalsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('savings_goals').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        user,
        categories: categoriesRes.data || [],
        transactions: transactionsRes.data || [],
        goals: goalsRes.data || []
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'moneyvision_data.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Successo",
        description: "Dati esportati con successo",
      });
      return true;
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Errore",
        description: "Impossibile esportare i dati",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const importData = async (data: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const importData = JSON.parse(data);
      
      // Import categories
      if (Array.isArray(importData.categories)) {
        const categories = importData.categories.map((cat: any) => ({
          ...cat,
          user_id: user.id,
          id: undefined // Let database generate new IDs
        }));
        
        await supabase.from('categories').insert(categories);
      }
      
      // Import transactions
      if (Array.isArray(importData.transactions)) {
        const transactions = importData.transactions.map((trans: any) => ({
          ...trans,
          user_id: user.id,
          id: undefined // Let database generate new IDs
        }));
        
        await supabase.from('transactions').insert(transactions);
      }
      
      // Import goals
      if (Array.isArray(importData.goals)) {
        const goals = importData.goals.map((goal: any) => ({
          ...goal,
          user_id: user.id,
          id: undefined // Let database generate new IDs
        }));
        
        await supabase.from('savings_goals').insert(goals);
      }
      
      toast({
        title: "Successo",
        description: "Dati importati con successo",
      });
      return true;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Errore",
        description: "Impossibile importare i dati",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUserPreferences,
    changePassword,
    deleteAccount,
    exportData,
    importData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
