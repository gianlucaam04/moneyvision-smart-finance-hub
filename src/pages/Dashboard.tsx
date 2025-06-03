
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
import { CirclePlus, Brain, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  // AI Smart Suggestions per la dashboard
  const aiDashboardSuggestions = [
    {
      type: 'alert',
      icon: '⚠️',
      title: 'Budget Alimentari Superato',
      message: 'Hai superato il budget per alimentari del 15% questo mese. Considera di ridurre le spese o aumentare il budget.',
      action: 'Rivedi Budget',
      priority: 'high',
      color: 'red'
    },
    {
      type: 'achievement',
      icon: '🎉',
      title: 'Obiettivo Quasi Raggiunto!',
      message: 'Ti mancano solo €150 per raggiungere il tuo obiettivo "Vacanza Estiva".',
      action: 'Aggiungi Fondi',
      priority: 'high',
      color: 'green'
    },
    {
      type: 'optimization',
      icon: '💡',
      title: 'Suggerimento di Risparmio',
      message: 'Potresti risparmiare €80/mese rivedendo i tuoi abbonamenti inutilizzati.',
      action: 'Mostra Dettagli',
      priority: 'medium',
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Dashboard Finanziaria
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Panoramica delle tue finanze
                </p>
              </div>
              
              {/* Quick Add Transaction */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <CirclePlus className="w-4 h-4 mr-2" />
                    Nuova Transazione
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <TransactionForm />
                </DialogContent>
              </Dialog>
            </div>

            {/* AI Smart Suggestions */}
            <Card className="animate-fade-in border-l-4 border-l-finance-blue">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-finance-blue" />
                  AI Smart Insights
                  <span className="ml-2 px-2 py-1 text-xs bg-finance-blue text-white rounded-full">
                    3 nuovi
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiDashboardSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                        suggestion.color === 'red' 
                          ? 'bg-red-50 border-l-red-400 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                          : suggestion.color === 'green'
                          ? 'bg-green-50 border-l-green-400 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'bg-blue-50 border-l-blue-400 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {suggestion.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`hover:text-white ${
                              suggestion.color === 'red' ? 'hover:bg-red-500' :
                              suggestion.color === 'green' ? 'hover:bg-green-500' :
                              'hover:bg-blue-500'
                            }`}
                          >
                            {suggestion.action}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary Cards */}
            <div className="animate-fade-in">
              <FinancialSummary />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="animate-fade-in">
                <RecentTransactions />
              </div>

              {/* Savings Goals */}
              <div className="animate-fade-in">
                <SavingsGoalsCard />
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-finance-green" />
                  Azioni Rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover:bg-finance-blue hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <CirclePlus className="w-6 h-6" />
                    <span className="text-sm">Aggiungi Spesa</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover:bg-finance-green hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <Target className="w-6 h-6" />
                    <span className="text-sm">Nuovo Obiettivo</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover:bg-purple-500 hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm">Vedi Statistiche</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2 hover:bg-orange-500 hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-sm">Budget Alert</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
    </div>
  );
};

export default Dashboard;
