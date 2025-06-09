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
  importData: (jsonContent: string) => Promise<boolean>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
  
  const importData = async (jsonContent: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const data = JSON.parse(jsonContent);
      console.log('Dati da importare:', data);
      
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Formato file non valido: transazioni mancanti');
      }

      const currentDate = new Date();
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);

      // Separa transazioni recenti e storiche
      const recentTransactions = [];
      const historicalTransactions = [];
      
      data.transactions.forEach((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= threeYearsAgo) {
          recentTransactions.push({
            ...transaction,
            user_id: user.id,
            id: undefined // Lascia che il database generi un nuovo ID
          });
        } else {
          historicalTransactions.push(transaction);
        }
      });

      console.log(`Transazioni recenti: ${recentTransactions.length}, Storiche: ${historicalTransactions.length}`);

      // Importa transazioni recenti
      if (recentTransactions.length > 0) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(recentTransactions);

        if (transactionError) {
          console.error('Errore importazione transazioni:', transactionError);
          throw transactionError;
        }
      }

      // Importa categorie se presenti
      if (data.categories && Array.isArray(data.categories)) {
        const categoriesToImport = data.categories.map((category: any) => ({
          ...category,
          user_id: user.id,
          id: undefined
        }));

        const { error: categoryError } = await supabase
          .from('categories')
          .insert(categoriesToImport);

        if (categoryError) {
          console.error('Errore importazione categorie:', categoryError);
          // Non bloccare l'importazione per errori nelle categorie
        }
      }

      // Importa obiettivi se presenti
      if (data.goals && Array.isArray(data.goals)) {
        const goalsToImport = data.goals.map((goal: any) => ({
          ...goal,
          user_id: user.id,
          id: undefined
        }));

        const { error: goalsError } = await supabase
          .from('savings_goals')
          .insert(goalsToImport);

        if (goalsError) {
          console.error('Errore importazione obiettivi:', goalsError);
        }
      }

      // Importa investimenti se presenti
      if (data.investments && Array.isArray(data.investments)) {
        const investmentsToImport = data.investments.map((investment: any) => ({
          ...investment,
          user_id: user.id,
          id: undefined
        }));

        const { error: investmentsError } = await supabase
          .from('investments')
          .insert(investmentsToImport);

        if (investmentsError) {
          console.error('Errore importazione investimenti:', investmentsError);
        }
      }

      // Salva dati storici nell'archivio se presenti
      if (historicalTransactions.length > 0) {
        const historicalCategories = data.categories?.filter((cat: any) => 
          historicalTransactions.some((trans: any) => trans.category === cat.name)
        ) || [];

        const archiveData = {
          transactions: historicalTransactions,
          categories: historicalCategories,
          archived_at: new Date().toISOString(),
          archive_reason: 'import_historical_data'
        };

        const { error: archiveError } = await supabase
          .from('archives')
          .insert({
            user_id: user.id,
            file_name: `import_historical_${new Date().toISOString().split('T')[0]}`,
            file_data: archiveData,
            archive_type: 'import_archive',
            date_range_start: historicalTransactions.reduce((min, trans) => {
              const date = new Date(trans.date);
              return date < min ? date : min;
            }, new Date(historicalTransactions[0].date)).toISOString().split('T')[0],
            date_range_end: threeYearsAgo.toISOString().split('T')[0]
          });

        if (archiveError) {
          console.error('Errore salvataggio dati storici:', archiveError);
        } else {
          console.log('Dati storici salvati nell\'archivio');
        }
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'importazione:', error);
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
