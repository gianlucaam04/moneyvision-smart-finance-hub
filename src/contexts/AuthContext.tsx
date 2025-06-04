
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

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

  useEffect(() => {
    // Simula controllo sessione esistente
    const savedUser = localStorage.getItem('moneyvision_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveUserToStorage = (updatedUser: User) => {
    localStorage.setItem('moneyvision_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simula chiamata API - in produzione sarà Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@moneyvision.app' && password === 'demo123') {
      const newUser: User = {
        id: '1',
        email,
        name: 'Demo User',
        preferences: {
          theme: 'system',
          currency: 'EUR',
          notifications: true,
          language: 'it',
          biometricAuth: false
        }
      };
      
      saveUserToStorage(newUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moneyvision_user');
  };
  
  const updateUserPreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    saveUserToStorage(updatedUser);
    
    // Applica il tema immediatamente se cambiato
    if (preferences.theme) {
      document.documentElement.classList.toggle('dark', 
        preferences.theme === 'dark' || 
        (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }
  };
  
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simula chiamata API - in produzione sarà Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Controlla la vecchia password (solo per demo)
    if (oldPassword === 'demo123') {
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };
  
  const deleteAccount = async (): Promise<boolean> => {
    setIsLoading(true);
    
    // Simula chiamata API - in produzione sarà Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Elimina l'account e i dati
    logout();
    localStorage.clear();
    setIsLoading(false);
    return true;
  };
  
  const exportData = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Raccoglie tutti i dati dell'utente
    const userDataString = localStorage.getItem('moneyvision_user');
    const transactionsString = localStorage.getItem('moneyvision_transactions');
    const goalsString = localStorage.getItem('moneyvision_goals');
    
    // Crea un oggetto con tutti i dati
    const exportData = {
      user: userDataString ? JSON.parse(userDataString) : null,
      transactions: transactionsString ? JSON.parse(transactionsString) : [],
      goals: goalsString ? JSON.parse(goalsString) : []
    };
    
    // Crea un file scaricabile
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'moneyvision_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  };
  
  const importData = async (data: string): Promise<boolean> => {
    try {
      const importData = JSON.parse(data);
      
      // Valida i dati importati
      if (importData.user) {
        localStorage.setItem('moneyvision_user', JSON.stringify(importData.user));
      }
      
      if (Array.isArray(importData.transactions)) {
        localStorage.setItem('moneyvision_transactions', JSON.stringify(importData.transactions));
      }
      
      if (Array.isArray(importData.goals)) {
        localStorage.setItem('moneyvision_goals', JSON.stringify(importData.goals));
      }
      
      // Ricarica i dati utente
      const savedUser = localStorage.getItem('moneyvision_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      return true;
    } catch (error) {
      console.error('Errore durante l\'importazione dei dati:', error);
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
