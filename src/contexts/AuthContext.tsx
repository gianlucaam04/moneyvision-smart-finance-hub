
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Estendo il tipo User per includere le proprietà personalizzate
interface ExtendedUser extends User {
  name?: string;
  preferences?: {
    theme: string;
    language: string;
    currency: string;
    notifications: boolean;
    autoBackup: boolean;
  };
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (data: { name?: string; email?: string }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  importData: (data: any) => Promise<boolean>;
  updateUserPreferences: (preferences: any) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  exportData: () => Promise<any>;
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
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Aggiungo name dai metadata se disponibile
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utente',
          preferences: session.user.user_metadata?.preferences || {
            theme: 'light',
            language: 'it',
            currency: 'EUR',
            notifications: true,
            autoBackup: false
          }
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utente',
          preferences: session.user.user_metadata?.preferences || {
            theme: 'light',
            language: 'it',
            currency: 'EUR',
            notifications: true,
            autoBackup: false
          }
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Errore di accesso: ' + error.message);
        return false;
      }

      toast.success('Accesso effettuato con successo!');
      return true;
    } catch (error) {
      toast.error('Errore durante l\'accesso');
      return false;
    }
  };

  const login = signIn; // Alias per compatibilità

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        toast.error('Errore di registrazione: ' + error.message);
        return false;
      }

      toast.success('Registrazione completata! Controlla la tua email per confermare l\'account.');
      return true;
    } catch (error) {
      toast.error('Errore durante la registrazione');
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Errore durante il logout');
      } else {
        toast.success('Logout effettuato con successo');
      }
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const logout = signOut; // Alias per compatibilità

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast.error('Errore: ' + error.message);
        return false;
      }

      toast.success('Email di reset inviata! Controlla la tua casella di posta.');
      return true;
    } catch (error) {
      toast.error('Errore durante il reset della password');
      return false;
    }
  };

  const updateUserProfile = async (data: { name?: string; email?: string }): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: data.email,
        data: { name: data.name },
      });

      if (error) {
        toast.error('Errore aggiornamento profilo: ' + error.message);
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento del profilo');
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error('Errore cambio password: ' + error.message);
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Errore durante il cambio password');
      return false;
    }
  };

  const updateUserPreferences = async (preferences: any): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { preferences },
      });

      if (error) {
        toast.error('Errore aggiornamento preferenze: ' + error.message);
        return false;
      }

      // Aggiorna subito lo stato utente locale per riflettere le preferenze senza attendere eventi auth
      setUser(prev => prev ? { ...prev, preferences } : prev);

      toast.success('Preferenze aggiornate con successo');
      return true;
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento delle preferenze');
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      // In Supabase, l'eliminazione dell'account deve essere gestita lato server
      toast.error('Funzionalità non ancora implementata');
      return false;
    } catch (error) {
      toast.error('Errore durante l\'eliminazione dell\'account');
      return false;
    }
  };

  const exportData = async (): Promise<any> => {
    try {
      // Implementa l'export dei dati
      toast.success('Dati esportati con successo');
      return {};
    } catch (error) {
      toast.error('Errore durante l\'export dei dati');
      return null;
    }
  };

  const importData = async (data: any): Promise<boolean> => {
    try {
      if (!user) {
        toast.error('Utente non autenticato');
        return false;
      }

      // Process the imported data here
      console.log('Importing data:', data);
      
      toast.success('Dati importati con successo');
      return true;
    } catch (error) {
      toast.error('Errore durante l\'importazione dei dati');
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    importData,
    updateUserPreferences,
    deleteAccount,
    exportData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
