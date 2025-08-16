
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus, TrendingUp, Target, BarChart3, Calendar, Sparkles, ArrowRight, Activity, Eye } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, goals, summary } = useFinance();
  const isMobile = useIsMobile();

  const quickActions = [
    {
      title: 'Nuova Transazione',
      icon: Plus,
      onClick: () => navigate('/transactions'),
      color: 'bg-brand-primary',
    },
    {
      title: 'Nuovo Obiettivo',
      icon: Target,
      onClick: () => navigate('/goals'),
      color: 'bg-brand-secondary',
    },
    {
      title: 'Analisi',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      color: 'bg-brand-accent',
    },
    {
      title: 'Investimenti',
      icon: TrendingUp,
      onClick: () => navigate('/investments'),
      color: 'bg-gradient-to-r from-brand-primary to-brand-secondary',
    },
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const todayExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Mobile Layout
  if (isMobile) {
    return (
      <Layout>
        <div className="space-y-4">
          {/* Mobile Header - Compatto */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Ciao! 👋</h1>
                <p className="text-brand-light text-sm">
                  {new Date().toLocaleDateString('it-IT', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
              {todayExpenses > 0 && (
                <div className="text-right">
                  <div className="text-xs text-brand-light">Spese oggi</div>
                  <div className="text-lg font-bold">{formatCurrency(todayExpenses)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Mobile - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center space-y-2 shadow-lg active:scale-95 transition-transform`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{action.title}</span>
              </button>
            ))}
          </div>

          {/* Summary compatto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Panoramica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Entrate</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Spese</div>
                  <div className="text-lg font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
                </div>
              </div>
              <div className="text-center p-3 bg-brand-light dark:bg-brand-accent/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Bilancio Mensile</div>
                <div className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.balance)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiche veloci */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-brand-primary">{thisMonthTransactions.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Transazioni mese</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{goals.filter(g => !g.isCompleted).length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Obiettivi attivi</div>
              </CardContent>
            </Card>
          </div>

          {/* Transazioni e Obiettivi */}
          <div className="space-y-4">
            <RecentTransactions />
            <SavingsGoalsCard />
          </div>

          {/* Tip del giorno - Compatto */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">💡 Consiglio</h3>
                  <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                    Controlla regolarmente le tue spese per una migliore gestione finanziaria!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Desktop Layout - Mantiene il design originale migliorato
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent rounded-2xl p-8 text-white relative overflow-hidden">
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
                    <p className="text-brand-light text-lg mt-1">
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
                <div className="text-sm text-brand-light">
                  {new Date().toLocaleDateString('it-IT', { 
                    year: 'numeric', 
                    month: 'long'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <FinancialSummary />

        {/* Quick Actions */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-brand-light dark:bg-brand-accent/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-brand-primary" />
              </div>
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={action.onClick}
                >
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full ${action.color} text-white`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {action.title}
                      </h3>
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
