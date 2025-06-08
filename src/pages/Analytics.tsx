import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Target, Lightbulb, Calendar, PieChart as PieChartIcon, Loader, RefreshCw, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Together from 'together-ai';
import { BUILD_FORECAST_PROMPT } from '@/prompts/forecastPrompts';
const TOGETHER_API_KEY = '3e5e74406a4de464802163316677abf0b8fae098ac9d23ad1df8fee3a48eb45f';
const together = new Together({ apiKey: TOGETHER_API_KEY });

// Caching e limiti API
const FREE_CALL_LIMIT = 5;

const Analytics: React.FC = () => {
  const { transactions, categories, summary } = useFinance();
  const [timeRange, setTimeRange] = useState<'thisMonth' | 'last3Months' | 'thisYear' | 'custom'>('thisMonth');
  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState<'trends' | 'categories' | 'predictions' | 'comparison'>('trends');
  const [predictions, setPredictions] = useState<{ title: string; content: string }[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [remainingCalls, setRemainingCalls] = useState<number>(() => Number(localStorage.getItem('apiRemaining')) || FREE_CALL_LIMIT);
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [forecast, setForecast] = useState<string | null>(null);

  // Compute period bounds
  const { start, end } = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;
    if (timeRange === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeRange === 'last3Months') {
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (timeRange === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else { // custom
      start = startDate;
      end = endDate;
    }
    return { start, end };
  }, [timeRange, startDate, endDate]);

  // Filtered transactions
  const filteredTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    }), [transactions, start, end]
  );

  // Summary metrics
  const totalIncomeLocal = useMemo(() =>
    filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  , [filteredTx]);
  const totalExpensesLocal = useMemo(() =>
    filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  , [filteredTx]);
  const balanceLocal = totalIncomeLocal - totalExpensesLocal;

  // Monthly data
  const monthLabels = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const monthlyData = useMemo(() => {
    const data: any[] = [];
    const st = new Date(start.getFullYear(), start.getMonth(), 1);
    const en = new Date(end.getFullYear(), end.getMonth(), 1);
    for (let d = new Date(st); d <= en; d.setMonth(d.getMonth() + 1)) {
      const m = new Date(d);
      const txs = filteredTx.filter(t => {
        const dt = new Date(t.date);
        return dt.getMonth() === m.getMonth() && dt.getFullYear() === m.getFullYear();
      });
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
      data.push({ month: monthLabels[m.getMonth()], income, expenses, savings: income - expenses });
    }
    return data;
  }, [filteredTx, start, end]);

  // Category data for pie
  const categoryData = useMemo(() =>
    categories.filter(c => c.type === 'expense').map(c => ({
      name: c.name,
      value: filteredTx.filter(t => t.category === c.name && t.type === 'expense')
        .reduce((s, t) => s + Math.abs(t.amount), 0),
      color: c.color
    })), [categories, filteredTx]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  useEffect(() => {
    if (selectedTab === 'predictions') {
      const cache = localStorage.getItem(`predictions_${timeRange}`);
      if (cache) setPredictions(JSON.parse(cache));
      else fetchPredictions();
    }
  }, [selectedTab, timeRange]);

  async function fetchPredictions() {
    setStartTime(Date.now());
    if (remainingCalls <= 0) {
      alert('Limite chiamate API raggiunto');
      return;
    }
    setLoadingPredictions(true);
    try {
      // Solo ultimi 6 mesi
      const recent = monthlyData.slice(-6);
      const summaryStr = recent.map(d => `${d.month}: entrate ${d.income}, uscite ${d.expenses}, risparmio ${d.savings}`).join('; ');
      const prompt = BUILD_FORECAST_PROMPT(summaryStr);
      const response = await together.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      const text = response.choices[0].message.content;
      let jsonStr = text.trim();
      const codeFenceRegex = /```(?:json)?\n([\s\S]*?)```/;
      const match = codeFenceRegex.exec(jsonStr);
      if (match) jsonStr = match[1].trim();
      const data = JSON.parse(jsonStr);
      // Validazione struttura
      if (!data.predictions || !Array.isArray(data.predictions) || data.predictions.length !== 3) throw new Error('Formato non valido');
      data.predictions.forEach((p:any) => { if (typeof p.title !== 'string' || typeof p.content !== 'string') throw new Error('Tipo errato'); });
      const parsed = data.predictions;
      setPredictions(parsed);
      // Caching e decremento limite
      localStorage.setItem(`predictions_${timeRange}`, JSON.stringify(parsed));
      const rem = remainingCalls - 1; setRemainingCalls(rem); localStorage.setItem('apiRemaining', String(rem));
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoadingPredictions(false);
      setStartTime(null);
    }
  }

  // Timer for loading
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (loadingPredictions && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } else {
      setElapsedTime(0);
    }
    return () => timer && clearInterval(timer);
  }, [loadingPredictions, startTime]);

  // Gestione feedback
  function handleFeedback(idx:number, useful:boolean){
    setFeedback(f => ({...f,[idx]:useful}));
    // salva o invia feedback
    console.log('Feedback', idx, useful);
  }

  const generateForecast = async () => {
    setIsGeneratingForecast(true);
    try {
      const summaryStr = monthlyData.map(d => `${d.month}: entrate ${d.income}, uscite ${d.expenses}, risparmio ${d.savings}`).join('; ');
      const prompt = BUILD_FORECAST_PROMPT(summaryStr);
      const response = await together.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      const text = response.choices[0].message.content;
      let jsonStr = text.trim();
      const codeFenceRegex = /```(?:json)?\n([\s\S]*?)```/;
      const match = codeFenceRegex.exec(jsonStr);
      if (match) jsonStr = match[1].trim();
      const data = JSON.parse(jsonStr);
      // Validazione struttura
      if (!data.predictions || !Array.isArray(data.predictions) || data.predictions.length !== 3) throw new Error('Formato non valido');
      data.predictions.forEach((p:any) => { if (typeof p.title !== 'string' || typeof p.content !== 'string') throw new Error('Tipo errato'); });
      const forecast = data.predictions;
      setForecast(forecast);
    } catch (err) {
      console.error('Error generating forecast:', err);
    } finally {
      setIsGeneratingForecast(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 max-w-full overflow-x-hidden">
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
              
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as 'thisMonth' | 'last3Months' | 'thisYear' | 'custom')}
              >
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

              {timeRange === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    type="date"
                    value={startDate.toISOString().slice(0, 10)}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    aria-label="Data inizio"
                  />
                  <Input
                    type="date"
                    value={endDate.toISOString().slice(0, 10)}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    aria-label="Data fine"
                  />
                </div>
              )}
            </div>

            {/* Key Metrics - Mobile Optimized Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 animate-fade-in">
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Bilancio</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {formatCurrency(balanceLocal)}
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
                      {formatCurrency(totalIncomeLocal)}
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
                      {formatCurrency(totalExpensesLocal)}
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
                      {((totalIncomeLocal - totalExpensesLocal) / totalIncomeLocal * 100).toFixed(1)}%
                    </p>
                    <div className="flex items-center justify-center lg:justify-start mt-1">
                      <span className="text-xs text-gray-500">🎯 Obiettivo 20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts - Mobile Optimized Tabs */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'trends' | 'categories' | 'predictions' | 'comparison')} className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 h-auto">
                <TabsTrigger value="trends" className="text-xs lg:text-sm px-2 py-2">Andamenti</TabsTrigger>
                <TabsTrigger value="categories" className="text-xs lg:text-sm px-2 py-2">Categorie</TabsTrigger>
                <TabsTrigger value="predictions" className="text-xs lg:text-sm px-2 py-2">Previsioni Future</TabsTrigger>
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
                      <div className="space-y-3 lg:space-y-4 overflow-hidden w-full">
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
                {loadingPredictions ? (
                  <div className="flex flex-col items-center py-6 space-y-2">
                    <Loader className="animate-spin w-8 h-8 text-indigo-500" />
                    <p>Generazione previsioni future... {elapsedTime}s</p>
                  </div>
                ) : predictions.length === 0 ? (
                  <Button onClick={fetchPredictions}>Calcola Previsioni</Button>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {predictions.map((p, idx) => {
                      const titleLower = p.title.toLowerCase();
                      // Scegli icona e colore border in base al tipo di previsione
                      let Icon;
                      let borderColor;
                      if (titleLower.includes('proiezione') || titleLower.includes('entrate')) {
                        Icon = TrendingUp;
                        borderColor = 'border-green-400';
                      } else if (titleLower.includes('opportunità')) {
                        Icon = Target;
                        borderColor = 'border-blue-400';
                      } else if (titleLower.includes('rischi')) {
                        Icon = TrendingDown;
                        borderColor = 'border-red-400';
                      } else if (titleLower.includes('raccomandazioni')) {
                        Icon = Lightbulb;
                        borderColor = 'border-indigo-400';
                      } else {
                        // Default
                        Icon = Lightbulb;
                        borderColor = 'border-gray-400';
                      }
                      return (
                        <Card key={idx} className={`border-l-4 ${borderColor} bg-white dark:bg-gray-800 p-4 shadow-sm rounded-lg transform transition-shadow duration-300 hover:shadow-lg`}>
                          <CardHeader className="flex items-center space-x-2 pb-3">
                            <Icon className="w-5 h-5 text-indigo-500" />
                            <CardTitle className="text-lg lg:text-xl font-semibold">{p.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-base text-gray-700 dark:text-gray-300">
                            {p.content}
                            <div className="mt-2 flex space-x-2">
                              <Button size="sm" variant={feedback[idx] === true ? 'default' : 'outline'} onClick={() => handleFeedback(idx, true)}>👍</Button>
                              <Button size="sm" variant={feedback[idx] === false ? 'default' : 'outline'} onClick={() => handleFeedback(idx, false)}>👎</Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg lg:text-xl">Line Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 lg:h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Entrate" />
                          <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Uscite" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg lg:text-xl">Pie Chart</CardTitle>
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
              </TabsContent>
            </Tabs>

            {/* Sezione Previsioni Migliorata */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        Previsioni Intelligenti
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Analisi predittiva basata sui tuoi dati finanziari
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={generateForecast}
                    disabled={isGeneratingForecast}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg transition-all duration-200"
                  >
                    {isGeneratingForecast ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generazione...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Genera Previsioni
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isGeneratingForecast ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        L'intelligenza artificiale sta analizzando i tuoi dati...
                      </p>
                    </div>
                  </div>
                ) : forecast ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap leading-relaxed">{forecast}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Brain className="w-3 h-3" />
                      <span>Previsioni generate tramite intelligenza artificiale</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                        <Brain className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Previsioni non ancora generate
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Clicca il pulsante per generare previsioni intelligenti sui tuoi dati finanziari
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50 overflow-hidden">
        <Navigation className="flex flex-row justify-around items-center space-y-0" />
      </nav>
    </div>
  );
};

export default Analytics;
