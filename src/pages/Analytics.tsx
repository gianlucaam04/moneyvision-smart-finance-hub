
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, PieChart as PieChartIcon, X, Brain, AlertTriangle } from 'lucide-react';

const Analytics: React.FC = () => {
  const { transactions, summary } = useFinance();
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // AI Smart Insights - Notifiche proattive discrete
  const aiSmartInsights = [
    {
      id: 1,
      type: 'alert',
      icon: '⚠️',
      title: 'Spesa Anomala Rilevata',
      message: 'Le tue spese per intrattenimento sono aumentate del 30% rispetto al mese scorso.',
      actions: ['Rivedi Budget', 'Ignora']
    },
    {
      id: 2,
      type: 'suggestion',
      icon: '💡',
      title: 'Opportunità di Risparmio',
      message: 'Potresti risparmiare €120/mese ottimizzando gli abbonamenti non utilizzati.',
      actions: ['Mostra Dettagli', 'Ignora']
    },
    {
      id: 3,
      type: 'achievement',
      icon: '🎉',
      title: 'Obiettivo Quasi Raggiunto',
      message: 'Ti mancano solo €200 per raggiungere il tuo obiettivo "Vacanza Estiva".',
      actions: ['Aggiungi Fondi', 'Visualizza']
    }
  ];

  const visibleInsights = aiSmartInsights.filter(insight => !dismissedInsights.includes(insight.id));

  const dismissInsight = (id: number) => {
    setDismissedInsights(prev => [...prev, id]);
  };

  // Mock data ottimizzato per mobile
  const monthlyData = [
    { month: 'Gen', income: 3200, expenses: 2800, savings: 400 },
    { month: 'Feb', income: 3400, expenses: 2900, savings: 500 },
    { month: 'Mar', income: 3100, expenses: 2700, savings: 400 },
    { month: 'Apr', income: 3500, expenses: 3100, savings: 400 },
    { month: 'Mag', income: 3300, expenses: 2850, savings: 450 },
    { month: 'Giu', income: 3600, expenses: 3200, savings: 400 },
  ];

  const categoryData = [
    { name: 'Alimentari', value: 800, color: '#10B981' },
    { name: 'Trasporti', value: 400, color: '#3B82F6' },
    { name: 'Svago', value: 300, color: '#8B5CF6' },
    { name: 'Bollette', value: 500, color: '#EF4444' },
    { name: 'Altro', value: 200, color: '#6B7280' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
            {/* Header Section - Mobile Optimized */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Analisi Finanziarie
                </h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
                  Insights dettagliati sulle tue finanze
                </p>
              </div>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-48">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">Questo Mese</SelectItem>
                  <SelectItem value="last3Months">Ultimi 3 Mesi</SelectItem>
                  <SelectItem value="thisYear">Quest'Anno</SelectItem>
                  <SelectItem value="custom">Personalizzato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Smart Insights - Notifiche Card Discrete */}
            {visibleInsights.length > 0 && (
              <div className="space-y-2">
                {visibleInsights.map((insight) => (
                  <Card key={insight.id} className={`border-l-4 ${
                    insight.type === 'alert' ? 'border-l-red-400 bg-red-50 dark:bg-red-900/10' :
                    insight.type === 'suggestion' ? 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10' :
                    'border-l-green-400 bg-green-50 dark:bg-green-900/10'
                  } animate-fade-in`}>
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg lg:text-xl flex-shrink-0">{insight.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">
                                {insight.title}
                              </h4>
                              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {insight.message}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissInsight(insight.id)}
                              className="p-1 h-auto flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {insight.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant={idx === 0 ? "default" : "outline"}
                                className="text-xs px-3 py-1 h-auto"
                              >
                                {action}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Key Metrics - Mobile Optimized Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 animate-fade-in">
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Bilancio</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {formatCurrency(summary?.balance || 0)}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start mt-1">
                      <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-success mr-1" />
                      <span className="text-xs text-success">+5.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Entrate</p>
                    <p className="text-lg lg:text-2xl font-bold text-success truncate">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start mt-1">
                      <span className="text-xs text-gray-500">📈 Mensili</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Uscite</p>
                    <p className="text-lg lg:text-2xl font-bold text-expense truncate">
                      {formatCurrency(summary?.totalExpenses || 0)}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start mt-1">
                      <span className="text-xs text-gray-500">📉 Mensili</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Risparmio</p>
                    <p className="text-lg lg:text-2xl font-bold text-finance-green">
                      {summary ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome * 100).toFixed(1) : '0'}%
                    </p>
                    <div className="flex items-center justify-center lg:justify-start mt-1">
                      <span className="text-xs text-gray-500">🎯 Obiettivo 20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts - Mobile Optimized Tabs */}
            <Tabs defaultValue="trends" className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 h-auto">
                <TabsTrigger value="trends" className="text-xs lg:text-sm px-2 py-2">Andamenti</TabsTrigger>
                <TabsTrigger value="categories" className="text-xs lg:text-sm px-2 py-2">Categorie</TabsTrigger>
                <TabsTrigger value="predictions" className="text-xs lg:text-sm px-2 py-2">Previsioni</TabsTrigger>
                <TabsTrigger value="comparison" className="text-xs lg:text-sm px-2 py-2 hidden lg:block">Confronti</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-4 lg:space-y-6 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg lg:text-xl">Trend Mensile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 lg:h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Entrate" />
                          <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Uscite" />
                          <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} name="Risparmi" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4 lg:space-y-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg lg:text-xl">
                        <PieChartIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Distribuzione Spese
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 lg:h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg lg:text-xl">Dettaglio Categorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 lg:space-y-4">
                        {categoryData.map((category) => (
                          <div key={category.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium text-sm lg:text-base">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm lg:text-base">{formatCurrency(category.value)}</div>
                              <div className="text-xs lg:text-sm text-gray-500">
                                {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4 lg:space-y-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg lg:text-xl">
                        <Brain className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Previsioni AI 🤖
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 lg:space-y-4">
                      <div className="p-3 lg:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm lg:text-base">📈 Trend Positivo</h4>
                        <p className="text-xs lg:text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Le tue spese per trasporti sono diminuite del 15% questo mese.
                        </p>
                      </div>
                      
                      <div className="p-3 lg:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm lg:text-base">⚠️ Attenzione</h4>
                        <p className="text-xs lg:text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Le spese per intrattenimento stanno aumentando. Considera un budget.
                        </p>
                      </div>
                      
                      <div className="p-3 lg:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm lg:text-base">🎯 Obiettivo</h4>
                        <p className="text-xs lg:text-sm text-green-700 dark:text-green-300 mt-1">
                          Mantieni questo ritmo e raggiungerai l'obiettivo di risparmio in 8 mesi.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg lg:text-xl">Raccomandazioni</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-base lg:text-lg flex-shrink-0">💡</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm lg:text-base">Ottimizza le spese ricorrenti</p>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                            Rivedi gli abbonamenti per risparmiare €120/mese
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-base lg:text-lg flex-shrink-0">📊</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm lg:text-base">Aumenta il risparmio</p>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                            Raggiungi il 20% riducendo le spese per intrattenimento
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-base lg:text-lg flex-shrink-0">🎯</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm lg:text-base">Nuovo obiettivo</p>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                            Crea un fondo emergenza pari a 6 mesi di spese
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4 lg:space-y-6 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg lg:text-xl">Entrate vs Uscite</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 lg:h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="income" fill="#10B981" name="Entrate" />
                          <Bar dataKey="expenses" fill="#EF4444" name="Uscite" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <Navigation className="flex flex-row justify-around items-center space-y-0" />
      </nav>
    </div>
  );
};

export default Analytics;
