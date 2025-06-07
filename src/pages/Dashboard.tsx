
import React from 'react';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import FinancialSummary from '@/components/Dashboard/FinancialSummary';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
import SavingsGoalsCard from '@/components/Dashboard/SavingsGoalsCard';
import TransactionForm from '@/components/Transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CirclePlus, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Configurazione dashboard

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0 overflow-x-hidden w-full">
      <Header />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8 overflow-hidden w-full">
            {/* Welcome Section con Tutorial per Nuovi Utenti */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    MoneyVision
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Il tuo tracker finanziario intelligente
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary Cards - Più chiaro e intuitivo */}
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-finance-blue" />
                Panoramica Finanziaria
              </h2>
              <FinancialSummary />
            </div>

            {/* Dashboard Grid - Sezioni più chiare */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Recent Transactions */}
              <div className="animate-fade-in w-full overflow-hidden">
                <RecentTransactions />
              </div>

              {/* Savings Goals */}
              <div className="animate-fade-in w-full overflow-hidden">
                <SavingsGoalsCard />
              </div>
            </div>
            
            {/* Spazio per contenuti futuri */}
            

            

          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50 shadow-lg overflow-hidden">
        <Navigation />
      </nav>
    </div>
  );
};

export default Dashboard;
