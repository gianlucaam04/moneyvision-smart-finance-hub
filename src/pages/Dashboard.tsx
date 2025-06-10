
import React from 'react';
import Layout from '@/components/Layout/Layout';
import FinancialSummary from '@/components/Dashboard/FinancialSummary';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
import SavingsGoalsCard from '@/components/Dashboard/SavingsGoalsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { Plus, TrendingUp, Target, CreditCard, BarChart3, Calendar, Sparkles, ArrowRight, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, goals, summary } = useFinance();

  const quickActions = [
    {
      title: 'Nuova Transazione',
      description: 'Aggiungi entrata o uscita',
      icon: Plus,
      onClick: () => navigate('/transactions'),
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Nuovo Obiettivo',
      description: 'Crea obiettivo di risparmio',
      icon: Target,
      onClick: () => navigate('/goals'),
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Visualizza Analisi',
      description: 'Grafici e statistiche',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      gradient: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const stats = [
    {
      title: 'Transazioni questo mese',
      value: thisMonthTransactions.length,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: thisMonthTransactions.length > 0 ? '+' + thisMonthTransactions.length : '0',
    },
    {
      title: 'Obiettivi attivi',
      value: goals.filter(g => !g.isCompleted).length,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: goals.filter(g => !g.isCompleted).length > 0 ? 'Attivi' : 'Nessuno',
    },
    {
      title: 'Trend mensile',
      value: summary.monthlyTrend === 'up' ? '↗️ Positivo' : summary.monthlyTrend === 'down' ? '↘️ Negativo' : '→ Stabile',
      icon: TrendingUp,
      color: summary.monthlyTrend === 'up' ? 'text-green-600' : summary.monthlyTrend === 'down' ? 'text-red-600' : 'text-gray-600',
      bgColor: summary.monthlyTrend === 'up' ? 'bg-green-50 dark:bg-green-900/20' : summary.monthlyTrend === 'down' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      trend: 'Andamento',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const todayExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">
                      Benvenuto nel tuo Dashboard 🏠
                    </h1>
                    <p className="text-blue-100 text-lg mt-1">
                      Ecco una panoramica delle tue finanze di oggi
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date().toLocaleDateString('it-IT', { 
                      weekday: 'long', 
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Badge>
                  {todayExpenses > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                      <Activity className="w-4 h-4 mr-2" />
                      Spese oggi: {formatCurrency(todayExpenses)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-6xl font-bold opacity-20">
                  {new Date().getDate()}
                </div>
                <div className="text-sm text-blue-200">
                  {new Date().toLocaleDateString('it-IT', { 
                    year: 'numeric', 
                    month: 'long'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards migliorati */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className={`p-4 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Summary */}
        <FinancialSummary />

        {/* Quick Actions rinnovate */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  Azioni Rapide
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Accedi rapidamente alle funzioni principali
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-xl ${action.bgColor} p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                  onClick={action.onClick}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${action.gradient} text-white`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentTransactions />
          <SavingsGoalsCard />
        </div>

        {/* Suggerimento del giorno */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  💡 Suggerimento del Giorno
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  Controlla regolarmente i tuoi obiettivi e mantieni traccia delle tue spese per una migliore gestione finanziaria. 
                  Ricorda di aggiornare le tue categorie di spesa per un'analisi più precisa!
                </p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/goals')}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                  >
                    Visualizza Obiettivi
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/analytics')}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                  >
                    Analizza Spese
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
