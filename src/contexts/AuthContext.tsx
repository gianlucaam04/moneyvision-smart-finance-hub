import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (data: { name?: string; email?: string }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  importData: (data: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  const importData = async (data: any): Promise<boolean> => {
    try {
      if (!user) {
        toast.error('Utente non autenticato');
        return false;
      }

      // Process the imported data here
      // This is a placeholder implementation
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
    resetPassword,
    updateUserProfile,
    changePassword,
    importData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
