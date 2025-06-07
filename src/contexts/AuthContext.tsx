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
  updateUserProfile: (profile: { name?: string; email?: string }) => Promise<boolean>;
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

      // Parse preferences with fallback defaults
      const defaultPreferences = {
        theme: 'system' as const,
        currency: 'EUR',
        notifications: true,
        language: 'it',
        biometricAuth: false
      };

      let parsedPreferences = defaultPreferences;
      
      if (profile.preferences && typeof profile.preferences === 'object') {
        parsedPreferences = {
          ...defaultPreferences,
          ...profile.preferences
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        preferences: parsedPreferences
      } as User;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Sync session: initial + subsequent changes
    setIsLoading(true);
    const handleSession = async (session: any) => {
      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      handleSession(session);
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
      } else {
        handleSession(session);
      }
    });

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
      setIsLoading(false);
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
      
      // Import user profile and preferences if present
      if (importData.user) {
        const { email, name, preferences } = importData.user;
        if (email || name) {
          await updateUserProfile({ email, name });
        }
        if (preferences) {
          await updateUserPreferences(preferences);
        }
      }
      
      // Import categories with required defaults
      if (Array.isArray(importData.categories)) {
        const categories = importData.categories.map((cat: any) => ({
          user_id: user.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon || '',
          type: cat.type,
          budget: cat.budget ?? 0,
        }));
        await supabase.from('categories').insert(categories);
      }
      
      // Import transactions with required defaults
      if (Array.isArray(importData.transactions)) {
        const transactions = importData.transactions.map((trans: any) => ({
          user_id: user.id,
          amount: trans.amount,
          description: trans.description || '',
          category: trans.category,
          type: trans.type,
          date: trans.date,
          note: trans.note || '',
        }));
        await supabase.from('transactions').insert(transactions);
      }
      
      // Import savings goals with required defaults
      if (Array.isArray(importData.goals)) {
        const goals = importData.goals.map((goal: any) => ({
          user_id: user.id,
          title: goal.title,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          deadline: goal.deadline,
          color: goal.color || '#000000',
          description: goal.description || '',
          is_completed: goal.is_completed ?? false,
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

  const updateUserProfile = async (profileData: { name?: string; email?: string }): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      // Update auth table (email and metadata)
      if ((profileData.email && profileData.email !== user.email) || (profileData.name && profileData.name !== user.name)) {
        const payload: { email?: string; data?: Record<string, any> } = {};
        if (profileData.email && profileData.email !== user.email) payload.email = profileData.email;
        if (profileData.name && profileData.name !== user.name) payload.data = { name: profileData.name };
        const { error: authError } = await supabase.auth.updateUser(payload);
        if (authError) {
          toast({ title: "Errore", description: authError.message, variant: "destructive" });
          setIsLoading(false);
          return false;
        }
      }
      // Update profiles table
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      if (error || !updatedProfile) {
        toast({ title: "Errore", description: "Impossibile aggiornare il profilo.", variant: "destructive" });
        setIsLoading(false);
        return false;
      }
      
      // Parse the updated profile with proper type conversion
      const parsedProfile = await loadUserProfile(user.id);
      if (parsedProfile) {
        setUser(parsedProfile);
      }
      
      toast({ title: "Successo", description: "Profilo aggiornato con successo." });
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Profilo update error:', err);
      toast({ title: "Errore", description: "Impossibile aggiornare il profilo.", variant: "destructive" });
      setIsLoading(false);
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
    importData,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
