import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  AlertCircle,
  Sparkles,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Brain,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';

const Analytics: React.FC = () => {
  const { transactions, categories } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState(6); // Default 6 mesi

  const startDate = useMemo(() => {
    return subMonths(new Date(), selectedPeriod);
  }, [selectedPeriod]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, {
        start: startDate,
        end: new Date()
      });
    });
  }, [transactions, startDate]);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { income: number; expenses: number; month: string } } = {};
    
    filteredTransactions.forEach(transaction => {
      const monthKey = format(new Date(transaction.date), 'yyyy-MM');
      const monthLabel = format(new Date(transaction.date), 'MMM yyyy', { locale: it });
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0, month: monthLabel };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += Number(transaction.amount);
      } else {
        months[monthKey].expenses += Number(transaction.amount);
      }
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        expensesByCategory[transaction.category] = 
          (expensesByCategory[transaction.category] || 0) + Number(transaction.amount);
      });
    
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0), 
    [filteredTransactions]
  );

  const totalExpenses = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0), 
    [filteredTransactions]
  );

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const generateForecast = () => {
    if (monthlyData.length < 3) return [];
    
    const lastThreeMonths = monthlyData.slice(-3);
    const avgIncome = lastThreeMonths.reduce((sum, m) => sum + m.income, 0) / 3;
    const avgExpenses = lastThreeMonths.reduce((sum, m) => sum + m.expenses, 0) / 3;
    
    const forecast = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthLabel = format(futureDate, 'MMM yyyy', { locale: it });
      
      // Aggiungi variazione casuale ±10%
      const incomeVariation = 1 + (Math.random() * 0.2 - 0.1);
      const expenseVariation = 1 + (Math.random() * 0.2 - 0.1);
      
      forecast.push({
        month: monthLabel,
        income: Math.round(avgIncome * incomeVariation),
        expenses: Math.round(avgExpenses * expenseVariation),
        isProjected: true
      });
    }
    
    return forecast;
  };

  const forecastData = generateForecast();
  const combinedData = [...monthlyData, ...forecastData];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analisi Finanziarie
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Insights e tendenze sui tuoi dati finanziari
              </p>
            </div>

            {/* Period Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {[3, 6, 12, 24].map(months => (
                    <Button
                      key={months}
                      variant={selectedPeriod === months ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(months)}
                    >
                      {months} {months === 1 ? 'mese' : 'mesi'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Entrate Totali
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalIncome)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Spese Totali
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalExpenses)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Bilancio Netto
                      </p>
                      <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netIncome)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tasso Risparmio
                      </p>
                      <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="trends">Tendenze</TabsTrigger>
                <TabsTrigger value="categories">Categorie</TabsTrigger>
                <TabsTrigger value="forecast">Previsioni</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Andamento Mensile</CardTitle>
                    <CardDescription>
                      Entrate vs Uscite negli ultimi {selectedPeriod} mesi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                            name="Entrate"
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            stackId="2"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.6}
                            name="Uscite"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spese per Categoria</CardTitle>
                      <CardDescription>
                        Distribuzione delle spese principali
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Categorie di Spesa</CardTitle>
                      <CardDescription>
                        Le categorie dove spendi di più
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryData.slice(0, 5).map((category, index) => (
                          <div key={category.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{category.name}</span>
                              <span className="text-sm font-semibold">
                                {formatCurrency(category.value)}
                              </span>
                            </div>
                            <Progress 
                              value={(category.value / categoryData[0]?.value) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-4">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                      Previsioni Intelligenti
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Basate sui tuoi pattern di spesa degli ultimi 3 mesi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            strokeWidth={3}
                            strokeDasharray={(entry: any) => entry?.isProjected ? "5 5" : "0"}
                            name="Entrate"
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            strokeWidth={3}
                            strokeDasharray={(entry: any) => entry?.isProjected ? "5 5" : "0"}
                            name="Uscite"
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                        <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Le linee tratteggiate rappresentano le previsioni
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {forecastData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {forecastData.map((forecast, index) => (
                      <Card key={forecast.month} className="border-dashed border-2 border-blue-200 dark:border-blue-800">
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                            {forecast.month}
                          </CardTitle>
                          <Badge variant="secondary" className="mx-auto">
                            <Zap className="w-3 h-3 mr-1" />
                            Previsione
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center">
                              <ArrowUpCircle className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium">Entrate</span>
                            </div>
                            <span className="font-bold text-green-600">
                              {formatCurrency(forecast.income)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center">
                              <ArrowDownCircle className="w-4 h-4 text-red-600 mr-2" />
                              <span className="text-sm font-medium">Uscite</span>
                            </div>
                            <span className="font-bold text-red-600">
                              {formatCurrency(forecast.expenses)}
                            </span>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Bilancio Previsto</span>
                            <p className={`font-bold text-lg ${
                              forecast.income - forecast.expenses >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(forecast.income - forecast.expenses)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                        Insights Automatici
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {savingsRate > 20 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800 dark:text-green-200">
                              Ottimo tasso di risparmio!
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                            Stai risparmiando il {savingsRate.toFixed(1)}% delle tue entrate. Continua così!
                          </p>
                        </div>
                      )}

                      {savingsRate < 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Attenzione alle spese
                            </span>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                            Le tue spese superano le entrate. Considera di rivedere il budget.
                          </p>
                        </div>
                      )}

                      {categoryData.length > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center">
                            <PieChartIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-800 dark:text-blue-200">
                              Categoria di spesa principale
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                            La maggior parte delle tue spese va in "{categoryData[0]?.name}" 
                            ({formatCurrency(categoryData[0]?.value)})
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Metriche Chiave</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Media spese mensili:</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(monthlyData.length > 0 ? 
                            monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length : 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Media entrate mensili:</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(monthlyData.length > 0 ? 
                            monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length : 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Transazioni totali:</span>
                        <span className="text-sm font-semibold">{filteredTransactions.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Categorie attive:</span>
                        <span className="text-sm font-semibold">{categoryData.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <Navigation />
      </nav>
    </div>
  );
};

export default Analytics;
