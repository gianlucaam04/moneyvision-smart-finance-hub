
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-finance-blue/20 via-white to-finance-green/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-finance-blue to-finance-green rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-white font-bold text-2xl">MV</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Caricamento MoneyVision...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
};

export default Index;
