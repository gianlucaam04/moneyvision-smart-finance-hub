
import React from 'react';
import Layout from '@/components/Layout/Layout';
import FinancialSummary from '@/components/Dashboard/FinancialSummary';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
import SavingsGoalsCard from '@/components/Dashboard/SavingsGoalsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { Plus, TrendingUp, Target, CreditCard, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, goals, summary } = useFinance();

  const quickActions = [
    {
      title: 'Nuova Transazione',
      description: 'Aggiungi entrata o uscita',
      icon: Plus,
      onClick: () => navigate('/transactions'),
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Nuovo Obiettivo',
      description: 'Crea obiettivo di risparmio',
      icon: Target,
      onClick: () => navigate('/goals'),
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Visualizza Analisi',
      description: 'Grafici e statistiche',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const stats = [
    {
      title: 'Transazioni questo mese',
      value: transactions.filter(t => {
        const date = new Date(t.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Obiettivi attivi',
      value: goals.filter(g => !g.isCompleted).length,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Trend mensile',
      value: summary.monthlyTrend === 'up' ? '↗️' : summary.monthlyTrend === 'down' ? '↘️' : '→',
      icon: TrendingUp,
      color: summary.monthlyTrend === 'up' ? 'text-green-600' : summary.monthlyTrend === 'down' ? 'text-red-600' : 'text-gray-600',
      bgColor: summary.monthlyTrend === 'up' ? 'bg-green-100' : summary.monthlyTrend === 'down' ? 'bg-red-100' : 'bg-gray-100',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header migliorato */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Benvenuto nel tuo Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Ecco una panoramica delle tue finanze di oggi
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Summary */}
        <FinancialSummary />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant="outline"
                  className={`h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r ${action.gradient} text-white border-0 hover:opacity-90 transition-opacity`}
                >
                  <action.icon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentTransactions />
          <SavingsGoalsCard />
        </div>

        {/* Footer info */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Suggerimento:</strong> Controlla regolarmente i tuoi obiettivi e mantieni traccia delle tue spese per una migliore gestione finanziaria.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
