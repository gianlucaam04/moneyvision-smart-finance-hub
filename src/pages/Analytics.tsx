
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
  Zap,
  Download,
  Filter
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import Layout from '@/components/Layout/Layout';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';

const Analytics: React.FC = () => {
  const { transactions, categories } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState(6);

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

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm mt-1" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {formatCurrency(entry.value)}
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

  const exportData = () => {
    const data = {
      period: `${selectedPeriod} mesi`,
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate: `${savingsRate.toFixed(1)}%`,
      monthlyData,
      categoryData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header moderno con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                📊 Analisi Finanziarie
              </h1>
              <p className="text-blue-100 text-lg">
                Insights avanzati sui tuoi dati finanziari
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm text-blue-200">
                  Analisi degli ultimi {selectedPeriod} mesi
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={exportData}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta Dati
              </Button>
              <div className="flex gap-2">
                <Filter className="w-5 h-5 mt-2" />
                <div className="flex flex-wrap gap-2">
                  {[3, 6, 12, 24].map(months => (
                    <Button
                      key={months}
                      variant={selectedPeriod === months ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(months)}
                      className={selectedPeriod === months 
                        ? "bg-white text-blue-600 hover:bg-gray-100" 
                        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                      }
                    >
                      {months}M
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards statistiche migliorate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Entrate Totali
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/30 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Spese Totali
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Bilancio Netto
                  </p>
                  <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Tasso Risparmio
                  </p>
                  <p className={`text-3xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tendenze
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Categorie
            </TabsTrigger>
            <TabsTrigger value="forecast" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Brain className="w-4 h-4 mr-2" />
              Previsioni
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      📈 Andamento Mensile
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                      Confronto entrate vs uscite negli ultimi {selectedPeriod} mesi
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {monthlyData.length} mesi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#incomeGradient)"
                        name="Entrate"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="url(#expenseGradient)"
                        name="Uscite"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🥧 Distribuzione Spese
                  </CardTitle>
                  <CardDescription>
                    Ripartizione per categoria
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
                          innerRadius={40}
                          paddingAngle={5}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Top Categorie
                  </CardTitle>
                  <CardDescription>
                    Le categorie con maggiori spese
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {categoryData.slice(0, 5).map((category, index) => (
                      <div key={category.name} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(category.value)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {((category.value / totalExpenses) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={(category.value / categoryData[0]?.value) * 100} 
                          className="h-3"
                          style={{ 
                            backgroundColor: `${colors[index % colors.length]}20`
                          }}
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
                        name="Entrate"
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={3}
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
    </Layout>
  );
};

export default Analytics;
