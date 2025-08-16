import React, { useState, useMemo, useCallback } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
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
  Minus,
  Sparkles,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Copy,
  Info,
  DollarSign,
  Filter,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useMonthlyInsights } from '@/ai/hooks/useMonthlyInsights';
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
 

const Analytics: React.FC = () => {
  const { transactions, categories } = useFinance();
  // Analisi per mese specifico (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const isMobile = useIsMobile();
  const { insights, insightsJson, loading: insightsLoading, error: insightsError, generate } = useMonthlyInsights();

  const handleCopy = useCallback((content: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
  }, []);

  // Calcola l'intervallo [inizio mese, fine mese] per il mese selezionato
  const { startDate, endDate } = useMemo(() => {
    const refDate = new Date(`${selectedMonth}-01`);
    return {
      startDate: startOfMonth(refDate),
      endDate: endOfMonth(refDate),
    };
  }, [selectedMonth]);

  // Evita di mostrare JSON grezzo se il parsing fallisce: mostra testo solo se non sembra JSON
  const shouldShowRawInsights = useMemo(() => {
    const s = (insights || '').trim();
    if (!s) return false;
    const looksLikeJson = s.startsWith('{') && s.endsWith('}');
    return !looksLikeJson;
  }, [insights]);


  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });
  }, [transactions, startDate, endDate]);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { income: number; expenses: number; month: string } } = {};
    
    filteredTransactions.forEach(transaction => {
      const monthKey = format(new Date(transaction.date), 'yyyy-MM');
      const monthLabel = format(new Date(transaction.date), 'MMM yyyy', { locale: it });
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0, month: monthLabel };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += Math.abs(Number(transaction.amount));
      } else {
        months[monthKey].expenses += Math.abs(Number(transaction.amount));
      }
    });
    
    // Ordinamento cronologico per chiave anno-mese
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [filteredTransactions]);

  


  const categoryData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        expensesByCategory[transaction.category] = 
          (expensesByCategory[transaction.category] || 0) + Math.abs(Number(transaction.amount));
      });
    
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0), 
    [filteredTransactions]
  );

  const totalExpenses = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0), 
    [filteredTransactions]
  );

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  // Metriche: confronto con mese precedente
  const {
    prevIncome,
    prevExpenses,
    incomeChangePct,
    expensesChangePct
  } = useMemo(() => {
    const refDate = new Date(`${selectedMonth}-01`);
    const prevRef = addMonths(refDate, -1);
    const prevStart = startOfMonth(prevRef);
    const prevEnd = endOfMonth(prevRef);

    const previousTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return isWithinInterval(d, { start: prevStart, end: prevEnd });
    });

    const pIncome = previousTransactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const pExpenses = previousTransactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const incomeDelta = pIncome > 0 ? ((totalIncome - pIncome) / pIncome) * 100 : 0;
    const expensesDelta = pExpenses > 0 ? ((totalExpenses - pExpenses) / pExpenses) * 100 : 0;

    return {
      prevIncome: pIncome,
      prevExpenses: pExpenses,
      incomeChangePct: incomeDelta,
      expensesChangePct: expensesDelta,
    };
  }, [selectedMonth, transactions, totalIncome, totalExpenses]);

  // Metriche: categorie in sforamento (spesa > budget)
  const overBudgetCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [] as { name: string; spent: number; budget: number }[];

    const expenseMap: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const key = t.category;
        expenseMap[key] = (expenseMap[key] || 0) + Math.abs(Number(t.amount));
      });

    return categories
      .filter(c => (c.type === 'expense' || c.type === 'both') && typeof c.budget === 'number' && c.budget! > 0)
      .map(c => ({ name: c.name, spent: expenseMap[c.name] || 0, budget: Number(c.budget) }))
      .filter(x => x.spent > x.budget)
      .sort((a, b) => (b.spent - b.budget) - (a.spent - a.budget));
  }, [filteredTransactions, categories]);

  // Metriche: spese ricorrenti (match per descrizione tra mese selezionato e precedente)
  const recurringExpenses = useMemo(() => {
    const refDate = new Date(`${selectedMonth}-01`);
    const prevRef = addMonths(refDate, -1);
    const prevStart = startOfMonth(prevRef);
    const prevEnd = endOfMonth(prevRef);

    const prevExpenseDescriptions = new Set(
      transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
          const d = new Date(t.date);
          return isWithinInterval(d, { start: prevStart, end: prevEnd });
        })
        .map(t => (t.description || '').trim().toLowerCase())
        .filter(Boolean)
    );

    return filteredTransactions
      .filter(t => t.type === 'expense')
      .filter(t => prevExpenseDescriptions.has((t.description || '').trim().toLowerCase()))
      .map(t => ({
        date: t.date,
        description: t.description,
        category: t.category,
        amount: Math.abs(Number(t.amount))
      }));
  }, [selectedMonth, filteredTransactions, transactions]);


  // Dati giornalieri cumulati per il mese selezionato (per grafico linea)
  const dailyCumulative = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let cumInc = 0;
    let cumExp = 0;
    return days.map(d => {
      const dayTx = filteredTransactions.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth() && td.getDate() === d.getDate();
      });
      const inc = dayTx
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      const exp = dayTx
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      cumInc += inc;
      cumExp += exp;
      return {
        day: format(d, 'dd MMM', { locale: it }),
        income: cumInc,
        expenses: cumExp,
      };
    });
  }, [filteredTransactions, startDate, endDate]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ color?: string; name?: string; value?: number | string }>;
    label?: string | number;
  };
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs mt-1" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {formatCurrency(Number(entry.value ?? 0))}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Mobile Layout
  // (Removed legacy early mobile return to ensure Tabs render on mobile)

  // Desktop/Mobile Layout - wrappato in Layout per avere sidebar/header e quick tabs mobile
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header desktop */}
        <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                📊 Analisi Finanziarie
              </h1>
              <p className="text-brand-light text-lg">
                Analisi del mese: {format(startDate, 'MMMM yyyy', { locale: it })}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm text-brand-light/80">
                  Seleziona un mese specifico
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 opacity-90" />
                <label className="sr-only" htmlFor="analytics-month">Seleziona mese</label>
                <input
                  id="analytics-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-full bg-white/15 border border-white/25 px-4 py-2 text-white placeholder-white/70 shadow-sm backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-brand-light/60 focus:border-brand-light/60 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards desktop */}
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

          <Card className="bg-gradient-to-br from-brand-light/30 to-brand-primary/20 dark:from-brand-primary/20 dark:to-brand-secondary/30 border-brand-primary/30 dark:border-brand-primary/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand-primary dark:text-brand-light">
                    Bilancio Netto
                  </p>
                  <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                  </p>
                </div>
                <div className="p-3 bg-brand-primary/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-brand-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-secondary/30 to-brand-accent/20 dark:from-brand-secondary/20 dark:to-brand-accent/30 border-brand-secondary/30 dark:border-brand-secondary/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand-secondary dark:text-brand-light">
                    Tasso Risparmio
                  </p>
                  <p className={`text-3xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-brand-secondary/20 rounded-full">
                  <Target className="h-6 w-6 text-brand-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs solo su mobile; su desktop mostriamo tutte le sezioni in sequenza */}
        {isMobile ? (
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-brand-light/50 data-[state=active]:text-brand-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tendenze
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-brand-light/50 data-[state=active]:text-brand-secondary">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Categorie
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-brand-light/50 data-[state=active]:text-brand-accent">
              <Sparkles className="w-4 h-4 mr-2" />
              Insights AI
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
                      Confronto entrate vs uscite nel mese selezionato
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
                              {totalExpenses > 0 ? ((category.value / totalExpenses) * 100).toFixed(1) : '0.0'}%
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={categoryData[0]?.value ? (category.value / categoryData[0].value) * 100 : 0} 
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

          {/* Sezione Previsioni rimossa */}

          {/* TabsContent per Insights AI (mobile) */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-brand-light/30 via-white to-brand-primary/20 dark:from-brand-primary/20 dark:via-gray-800 dark:to-brand-secondary/20 backdrop-blur-sm border-0 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 dark:from-brand-primary/10 dark:to-brand-secondary/10"></div>
              <CardHeader className="relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-bounce"></div>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                        Insights AI del mese
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Analisi intelligente basata sulle tue entrate
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      const monthLabel = format(startDate, 'MMMM yyyy', { locale: it });
                      generate({
                        monthLabel,
                        totalIncome,
                        totalExpenses,
                        netIncome,
                        topCategories: categoryData,
                        overBudgetCategories,
                        recurringExpenses,
                      });
                    }}
                    disabled={insightsLoading}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                  >
                    {insightsLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generazione...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Genera Insights
                      </div>
                    )}
                  </Button>
                  {insightsError && (
                    <div className="flex items-center text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4 mr-1" /> {insightsError}
                    </div>
                  )}
                </div>

                {/* Render strutturato quando arriva JSON; fallback al testo */}
                {insightsJson ? (
                  <div className="space-y-6 animate-in fade-in-50 duration-700">
                    {/* Totali (se presenti nel JSON) - Mobile responsive */}
                    {insightsJson.totals && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 border-0 shadow-lg">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Entrate</p>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(insightsJson.totals.income)}</p>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-900/30 dark:to-red-900/20 border-0 shadow-lg">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative">
                            <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">Spese</p>
                            <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{formatCurrency(insightsJson.totals.expenses)}</p>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-brand-light/30 to-brand-primary/20 dark:from-brand-primary/30 dark:to-brand-secondary/20 border-0 shadow-lg">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/10 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative">
                            <p className="text-sm font-medium text-brand-primary dark:text-brand-light mb-1">Netto</p>
                            <p className={`text-xl font-bold ${insightsJson.totals.netIncome >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{formatCurrency(insightsJson.totals.netIncome)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suggerimenti - Mobile responsive */}
                    {insightsJson.suggestions?.length ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-3 h-3 text-white" />
                          </div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">Suggerimenti</h4>
                        </div>
                        <div className="space-y-3">
                          {insightsJson.suggestions.slice(0, 3).map((s, i) => (
                            <div key={`sg-${i}`} className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                              <div className="text-sm text-gray-700 dark:text-gray-300">{s.text}</div>
                              {typeof s.impactEUR === 'number' && (
                                <div className="mt-2 text-xs text-brand-primary dark:text-brand-light font-medium">
                                  💰 Impatto: {formatCurrency(s.impactEUR)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Azioni - Mobile responsive */}
                    {insightsJson.actions?.length ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">Azioni</h4>
                        </div>
                        <div className="space-y-3">
                          {insightsJson.actions.slice(0, 3).map((a, i) => (
                            <div key={`ac-${i}`} className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                              <div className="text-sm text-gray-700 dark:text-gray-300">{a.text}</div>
                              {typeof a.impactEUR === 'number' && (
                                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  💸 Risparmio: {formatCurrency(a.impactEUR)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  shouldShowRawInsights && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm">
                      {insights}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Sezione Tendenze (Trends) */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      📈 Andamento Mensile
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                      Confronto entrate vs uscite nel mese selezionato
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

            {/* Sezione Categorie */}
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
                              {totalExpenses > 0 ? ((category.value / totalExpenses) * 100).toFixed(1) : '0.0'}%
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={categoryData[0]?.value ? (category.value / categoryData[0].value) * 100 : 0} 
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

            {/* Sezione Previsioni rimossa */}

            {/* Sezione Insights AI */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-brand-light/30 via-white to-brand-primary/20 dark:from-brand-primary/20 dark:via-gray-800 dark:to-brand-secondary/20 backdrop-blur-sm border-0 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 dark:from-brand-primary/10 dark:to-brand-secondary/10"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-bounce"></div>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                        Insights AI del mese
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Analisi intelligente basata sulle tue entrate
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      const monthLabel = format(startDate, 'MMMM yyyy', { locale: it });
                      generate({
                        monthLabel,
                        totalIncome,
                        totalExpenses,
                        netIncome,
                        topCategories: categoryData,
                        overBudgetCategories,
                        recurringExpenses,
                      });
                    }}
                    disabled={insightsLoading}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {insightsLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generazione in corso…
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Genera Insights
                      </div>
                    )}
                  </Button>
                  {insightsError && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" /> {insightsError}
                    </div>
                  )}
                </div>

                {/* Render strutturato quando arriva JSON; fallback al testo */}
                {insightsJson ? (
                  <div className="space-y-8 animate-in fade-in-50 duration-700">
                    {/* Totali (se presenti nel JSON) */}
                    {insightsJson.totals && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Entrate</p>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(insightsJson.totals.income)}</p>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-900/30 dark:to-red-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative">
                            <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-1">Spese</p>
                            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{formatCurrency(insightsJson.totals.expenses)}</p>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-brand-light/30 to-brand-primary/20 dark:from-brand-primary/30 dark:to-brand-secondary/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-primary/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative">
                            <p className="text-sm font-medium text-brand-primary dark:text-brand-light mb-1">Netto</p>
                            <p className={`text-2xl font-bold ${insightsJson.totals.netIncome >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{formatCurrency(insightsJson.totals.netIncome)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Categorie */}
                    {insightsJson.topCategories?.length ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2"><PieChartIcon className="w-4 h-4" />Categorie principali</h4>
                        <div className="space-y-3">
                          {insightsJson.topCategories.slice(0,6).map((c, i) => (
                            <div key={`${c.name}-${i}`} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{c.name}</span>
                                <span className="text-gray-600 dark:text-gray-400">{formatCurrency(c.value)}</span>
                              </div>
                              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded">
                                <div className="h-2 rounded bg-brand-primary" style={{ width: `${Math.min(100, (c.value / (insightsJson.topCategories[0]?.value || 1)) * 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Sforamenti budget */}
                    {insightsJson.overBudget?.length ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" />Categorie in sforamento</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[...insightsJson.overBudget].sort((a,b)=> (b.overPct ?? 0) - (a.overPct ?? 0)).map((o, i) => (
                            <div key={`${o.name}-${i}`} className="p-3 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-900/10">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{o.name}</div>
                                <Badge variant="secondary" className="bg-rose-100 text-rose-700">+{(o.overPct ?? 0).toFixed(1)}%</Badge>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Speso {formatCurrency(o.spent)} su budget {formatCurrency(o.budget)}
                              </div>
                              {o.tip && (
                                <div className="text-xs text-rose-700 dark:text-rose-300 mt-1">Consiglio: {o.tip}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Anomalie */}
                    {insightsJson.anomalies?.length ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600" />Anomalie</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {insightsJson.anomalies.map((a, i) => (
                            <li key={`an-${i}`}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Suggerimenti */}
                    {insightsJson.suggestions?.length ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Suggerimenti Intelligenti</h4>
                        </div>
                        <div className="grid gap-4">
                          {[...insightsJson.suggestions]
                            .sort((a,b)=>{
                              const p: Record<string, number> = {high:3, medium:2, low:1, alta:3, media:2, bassa:1};
                              const pa = a.priority ? p[String(a.priority).toLowerCase()] ?? 0 : 0;
                              const pb = b.priority ? p[String(b.priority).toLowerCase()] ?? 0 : 0;
                              if (pa !== pb) return pb - pa;
                              const ia = a.impactEUR ?? 0; const ib = b.impactEUR ?? 0;
                              return ib - ia;
                            })
                            .map((s, i) => {
                              const pr = String(s.priority || '').toLowerCase();
                              const priorityColors = {
                                high: 'from-red-500/20 to-rose-500/20 border-red-200 dark:border-red-800',
                                alta: 'from-red-500/20 to-rose-500/20 border-red-200 dark:border-red-800',
                                medium: 'from-amber-500/20 to-yellow-500/20 border-amber-200 dark:border-amber-800',
                                media: 'from-amber-500/20 to-yellow-500/20 border-amber-200 dark:border-amber-800',
                                low: 'from-emerald-500/20 to-green-500/20 border-emerald-200 dark:border-emerald-800',
                                bassa: 'from-emerald-500/20 to-green-500/20 border-emerald-200 dark:border-emerald-800'
                              };
                              return (
                              <div key={`sg-${i}`} className={`group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${priorityColors[pr as keyof typeof priorityColors] || 'from-gray-50 to-gray-100 border-gray-200 dark:border-gray-700'} border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    {s.title && <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{s.title}</div>}
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{s.text}</div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {s.priority && (
                                      <Badge className={`${pr==='high'||pr==='alta' ? 'bg-red-100 text-red-700 border-red-300' : pr==='medium'||pr==='media' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'} font-medium`}>
                                        {String(s.priority)}
                                      </Badge>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-8 w-8 hover:bg-white/50 dark:hover:bg-gray-800/50" onClick={() => handleCopy(`${s.title ? s.title+': ' : ''}${s.text}`)} aria-label="Copia suggerimento">
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                  {typeof s.impactEUR === 'number' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 border border-brand-primary/30 dark:border-brand-primary/50">
                                      <DollarSign className="w-4 h-4 text-brand-primary" />
                                      <span className="text-sm font-medium text-brand-primary dark:text-brand-light">
                                        Impatto: {formatCurrency(s.impactEUR)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {s.evidence && (
                                  <div className="mt-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50">
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Info className="w-4 h-4 mt-0.5 text-brand-primary" />
                                      <span>{s.evidence}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )})}
                        </div>
                      </div>
                    ) : null}

                    {/* Azioni consigliate */}
                    {insightsJson.actions?.length ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Azioni Immediate</h4>
                        </div>
                        <div className="grid gap-4">
                          {[...insightsJson.actions]
                            .sort((a,b)=>{
                              const p: Record<string, number> = {high:3, medium:2, low:1, alta:3, media:2, bassa:1};
                              const pa = a.priority ? p[String(a.priority).toLowerCase()] ?? 0 : 0;
                              const pb = b.priority ? p[String(b.priority).toLowerCase()] ?? 0 : 0;
                              if (pa !== pb) return pb - pa;
                              const ia = a.impactEUR ?? 0; const ib = b.impactEUR ?? 0;
                              return ib - ia;
                            })
                            .map((a, i) => {
                              const pr = String(a.priority || '').toLowerCase();
                              const priorityColors = {
                                high: 'from-red-500/20 to-rose-500/20 border-red-200 dark:border-red-800',
                                alta: 'from-red-500/20 to-rose-500/20 border-red-200 dark:border-red-800',
                                medium: 'from-amber-500/20 to-yellow-500/20 border-amber-200 dark:border-amber-800',
                                media: 'from-amber-500/20 to-yellow-500/20 border-amber-200 dark:border-amber-800',
                                low: 'from-emerald-500/20 to-green-500/20 border-emerald-200 dark:border-emerald-800',
                                bassa: 'from-emerald-500/20 to-green-500/20 border-emerald-200 dark:border-emerald-800'
                              };
                              return (
                              <div key={`ac-${i}`} className={`group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${priorityColors[pr as keyof typeof priorityColors] || 'from-gray-50 to-gray-100 border-gray-200 dark:border-gray-700'} border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    {a.title && <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{a.title}</div>}
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{a.text}</div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {a.priority && (
                                      <Badge className={`${pr==='high'||pr==='alta' ? 'bg-red-100 text-red-700 border-red-300' : pr==='medium'||pr==='media' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'} font-medium`}>
                                        {String(a.priority)}
                                      </Badge>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-8 w-8 hover:bg-white/50 dark:hover:bg-gray-800/50" onClick={() => handleCopy(`${a.title ? a.title+': ' : ''}${a.text}`)} aria-label="Copia azione">
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                  {typeof a.impactEUR === 'number' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 border border-brand-secondary/30 dark:border-brand-secondary/50">
                                      <DollarSign className="w-4 h-4 text-brand-secondary" />
                                      <span className="text-sm font-medium text-brand-secondary dark:text-brand-light">
                                        Risparmio: {formatCurrency(a.impactEUR)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {a.evidence && (
                                  <div className="mt-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50">
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Info className="w-4 h-4 mt-0.5 text-brand-secondary" />
                                      <span>{a.evidence}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )})}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  shouldShowRawInsights && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm">
                      {insights}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
            {/* Sezione Insights nascosta (rimossa) */}
          </div>
        )}
      </div>
    </Layout>
  );
  };

  export default Analytics;
