
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, PieChart as PieChartIcon } from 'lucide-react';

const Analytics: React.FC = () => {
  const { transactions, financialSummary } = useFinance();
  const [timeRange, setTimeRange] = useState('thisMonth');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Mock data per i grafici
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
    { name: 'Intrattenimento', value: 300, color: '#8B5CF6' },
    { name: 'Bollette', value: 500, color: '#EF4444' },
    { name: 'Altro', value: 200, color: '#6B7280' },
  ];

  const weeklySpendingData = [
    { week: 'Sett 1', amount: 520 },
    { week: 'Sett 2', amount: 680 },
    { week: 'Sett 3', amount: 450 },
    { week: 'Sett 4', amount: 750 },
  ];

  const incomeVsExpensesData = [
    { month: 'Gen', income: 3200, expenses: 2800 },
    { month: 'Feb', income: 3400, expenses: 2900 },
    { month: 'Mar', income: 3100, expenses: 2700 },
    { month: 'Apr', income: 3500, expenses: 3100 },
    { month: 'Mag', income: 3300, expenses: 2850 },
    { month: 'Giu', income: 3600, expenses: 3200 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Analisi Finanziarie
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Insights dettagliati sulle tue finanze
                </p>
              </div>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
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

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Bilancio Totale</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(financialSummary.balance)}
                      </p>
                      <div className="flex items-center mt-1">
                        {financialSummary.monthlyTrend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-success mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-expense mr-1" />
                        )}
                        <span className={`text-sm ${financialSummary.monthlyTrend === 'up' ? 'text-success' : 'text-expense'}`}>
                          {financialSummary.monthlyTrend === 'up' ? '📈' : '📉'} vs mese scorso
                        </span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-finance-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Entrate Mensili</p>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(financialSummary.totalIncome)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">📈 +5.2% questo mese</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Uscite Mensili</p>
                      <p className="text-2xl font-bold text-expense">
                        {formatCurrency(financialSummary.totalExpenses)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">📉 -2.1% questo mese</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-expense" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Tasso di Risparmio</p>
                      <p className="text-2xl font-bold text-finance-green">
                        {((financialSummary.totalIncome - financialSummary.totalExpenses) / financialSummary.totalIncome * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500 mt-1">🎯 Obiettivo: 20%</p>
                    </div>
                    <Target className="w-8 h-8 text-finance-green" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Tabs */}
            <Tabs defaultValue="trends" className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="trends">Andamenti</TabsTrigger>
                <TabsTrigger value="categories">Categorie</TabsTrigger>
                <TabsTrigger value="comparison">Confronti</TabsTrigger>
                <TabsTrigger value="predictions">Previsioni</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trend Mensile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Entrate" />
                          <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Uscite" />
                          <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} name="Risparmi" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spese Settimanali</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklySpendingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="amount" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChartIcon className="w-5 h-5 mr-2" />
                        Distribuzione Spese per Categoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spese per Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryData.map((category) => (
                          <div key={category.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(category.value)}</div>
                              <div className="text-sm text-gray-500">
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

              <TabsContent value="comparison" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Entrate vs Uscite</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={incomeVsExpensesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="income" fill="#10B981" name="Entrate" />
                        <Bar dataKey="expenses" fill="#EF4444" name="Uscite" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="predictions" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Previsioni AI 🤖</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">📈 Trend Positivo</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Le tue spese per trasporti sono diminuite del 15% questo mese. Continua così!
                        </p>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">⚠️ Attenzione</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Le spese per intrattenimento stanno aumentando. Considera di impostare un budget.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold text-green-900 dark:text-green-100">🎯 Obiettivo</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Mantieni questo ritmo e raggiungerai il tuo obiettivo di risparmio in 8 mesi.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Raccomandazioni</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">💡</span>
                        <div>
                          <p className="font-medium">Ottimizza le spese ricorrenti</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Rivedi i tuoi abbonamenti mensili per risparmiare fino a €120/mese
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">📊</span>
                        <div>
                          <p className="font-medium">Aumenta il tasso di risparmio</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Raggiungi il 20% di risparmio riducendo le spese per intrattenimento
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">🎯</span>
                        <div>
                          <p className="font-medium">Nuovo obiettivo suggerito</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Crea un fondo di emergenza pari a 6 mesi di spese
                          </p>
                        </div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
    </div>
  );
};

export default Analytics;
