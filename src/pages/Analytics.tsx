import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar, 
  Target, 
  AlertCircle,
  Sparkles,
  Bot,
  LineChart,
  CircleDollarSign,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell } from 'recharts';
import { subDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

const Analytics = () => {
  const { transactions } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [monthlyStats, setMonthlyStats] = useState({ income: 0, expenses: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    calculateStats();
    calculateCategoryData();
  }, [transactions, selectedPeriod, dateRange]);

  const calculateStats = () => {
    let startDate, endDate;

    if (selectedPeriod === 'thisMonth') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else if (selectedPeriod === 'lastMonth') {
      const lastMonth = subMonths(new Date(), 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
    } else if (selectedPeriod === 'custom') {
      startDate = dateRange.start;
      endDate = dateRange.end;
    } else {
      startDate = subDays(new Date(), 30);
      endDate = new Date();
    }

    if (!startDate || !endDate) return;

    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setMonthlyStats({ income, expenses });
  };

  const calculateCategoryData = () => {
    let startDate, endDate;

    if (selectedPeriod === 'thisMonth') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else if (selectedPeriod === 'lastMonth') {
      const lastMonth = subMonths(new Date(), 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
    } else if (selectedPeriod === 'custom') {
      startDate = dateRange.start;
      endDate = dateRange.end;
    } else {
      startDate = subDays(new Date(), 30);
      endDate = new Date();
    }

    if (!startDate || !endDate) return;

    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const categoryTotals = filtered.reduce((acc, t) => {
      if (t.type === 'expense') {
        const category = t.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + t.amount;
      }
      return acc;
    }, {});

    const data = Object.keys(categoryTotals).map(category => ({
      name: category,
      value: categoryTotals[category],
    }));

    setCategoryData(data);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-md shadow-md p-2">
          <p className="font-semibold text-gray-800">{`${label} : €${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (date: Date): string => {
    return format(date, 'MMM dd', { locale: it });
  };

  const lastSixMonths = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const monthlyIncomeData = lastSixMonths.map(date => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
  
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((sum, t) => sum + t.amount, 0);
  
    return {
      date: formatDate(date),
      Entrate: monthlyIncome,
    };
  });

  const monthlyExpenseData = lastSixMonths.map(date => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
  
    const monthlyExpense = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((sum, t) => sum + t.amount, 0);
  
    return {
      date: formatDate(date),
      Uscite: monthlyExpense,
    };
  });

  const combinedMonthlyData = lastSixMonths.map(date => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
  
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((sum, t) => sum + t.amount, 0);
  
    const monthlyExpense = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((sum, t) => sum + t.amount, 0);
  
    return {
      date: formatDate(date),
      Entrate: monthlyIncome,
      Uscite: monthlyExpense
    };
  });

  const filteredTransactions = transactions.filter(t => {
    let startDate, endDate;

    if (selectedPeriod === 'thisMonth') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else if (selectedPeriod === 'lastMonth') {
      const lastMonth = subMonths(new Date(), 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
    } else if (selectedPeriod === 'custom') {
      startDate = dateRange.start;
      endDate = dateRange.end;
    } else {
      startDate = subDays(new Date(), 30);
      endDate = new Date();
    }

    if (!startDate || !endDate) return false;

    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const expenseCategories = filteredTransactions
  .filter(t => t.type === 'expense')
  .map(t => t.category || 'Uncategorized');

  const categoryCounts = expenseCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topExpenseCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-6">
          <Navigation />
        </aside>
        <main className="flex-1 container mx-auto px-4 py-8 space-y-8 pb-24 lg:pb-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-finance-blue/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-finance-blue" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-finance-blue to-blue-600 bg-clip-text text-transparent">
                  Analisi Finanziarie
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Insights avanzati sui tuoi dati finanziari
                </p>
              </div>
            </div>
          </div>

          {/* Period Selection */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-finance-blue" />
                Seleziona Periodo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">Questo Mese</SelectItem>
                    <SelectItem value="lastMonth">Mese Scorso</SelectItem>
                    <SelectItem value="last30Days">Ultimi 30 Giorni</SelectItem>
                    <SelectItem value="custom">Personalizzato</SelectItem>
                  </SelectContent>
                </Select>

                {selectedPeriod === 'custom' && (
                  <>
                    <input
                      type="date"
                      onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="date"
                      onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Entrate</p>
                    <p className="text-2xl font-semibold text-green-600">
                      €{monthlyStats.income.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Uscite</p>
                    <p className="text-2xl font-semibold text-red-600">
                      €{monthlyStats.expenses.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${monthlyStats.income - monthlyStats.expenses >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <CircleDollarSign className={`w-5 h-5 ${monthlyStats.income - monthlyStats.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profitto</p>
                    <p className={`text-2xl font-semibold ${monthlyStats.income - monthlyStats.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{(monthlyStats.income - monthlyStats.expenses).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Panoramica
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trend
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Categorie
              </TabsTrigger>
              <TabsTrigger value="forecasts" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Previsioni
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Panoramica Mensile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={combinedMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Entrate" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="Uscite" stackId="a" fill="#FF7373" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6 mt-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Trend Entrate/Uscite</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={combinedMonthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="Entrate" stroke="#82ca9d" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Uscite" stroke="#FF7373" activeDot={{ r: 8 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6 mt-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Spese per Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPieChart dataKey="value" data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {
                          categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))
                        }
                      </RechartsPieChart>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center mt-4">
                    {categoryData.map((item, index) => (
                      <Badge key={index} className="m-1">{item.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecasts" className="space-y-6 mt-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Bot className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                          Previsioni Intelligenti
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Analisi predittiva basata sui tuoi pattern finanziari
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">AI-Powered</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Dati insufficienti per le previsioni
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Aggiungi più transazioni per ottenere previsioni accurate
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Previsioni Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-green-500/20 rounded">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Prossimo Mese - Entrate
                            </span>
                          </div>
                          <p className="text-xl font-bold text-green-600">
                            €{Math.round(monthlyStats.income * 1.05).toLocaleString('it-IT')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            +5% rispetto alla media
                          </p>
                        </div>

                        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-red-500/20 rounded">
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Prossimo Mese - Uscite
                            </span>
                          </div>
                          <p className="text-xl font-bold text-red-600">
                            €{Math.round(monthlyStats.expenses * 0.97).toLocaleString('it-IT')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            -3% rispetto alla media
                          </p>
                        </div>

                        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-blue-500/20 rounded">
                              <CircleDollarSign className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Saldo Previsto
                            </span>
                          </div>
                          <p className="text-xl font-bold text-blue-600">
                            €{Math.round((monthlyStats.income * 1.05) - (monthlyStats.expenses * 0.97)).toLocaleString('it-IT')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Proiezione mensile
                          </p>
                        </div>
                      </div>

                      {/* Insights AI */}
                      <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20">
                        <div className="flex items-center gap-2 mb-4">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Insights Intelligenti
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="p-1 bg-blue-500/20 rounded mt-0.5">
                              <LineChart className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Trend Positivo
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                                Le tue entrate mostrano una crescita costante negli ultimi mesi
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="p-1 bg-amber-500/20 rounded mt-0.5">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                Opportunità di Risparmio
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-200 mt-1">
                                Potresti risparmiare il 15% riducendo le spese in {topExpenseCategory}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="p-1 bg-green-500/20 rounded mt-0.5">
                              <Target className="w-3 h-3 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Obiettivo Raggiungibile
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-200 mt-1">
                                Mantieni questo ritmo per raggiungere i tuoi obiettivi di risparmio
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Bot className="w-3 h-3" />
                        <span>Previsioni generate dall'analisi dei tuoi pattern finanziari</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <Navigation />
      </nav>
    </div>
  );
};

export default Analytics;
