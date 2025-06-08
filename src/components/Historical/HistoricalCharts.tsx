
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';
import type { ArchiveData } from '@/services/archivesService';

interface HistoricalChartsProps {
  data: ArchiveData;
}

const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { transactions, categories } = data;

  // Prepara dati per il grafico mensile
  const monthlyData = React.useMemo(() => {
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const year = transactionDate.getFullYear().toString();
      
      if (selectedYear !== 'all' && year !== selectedYear) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      
      return true;
    });

    const months = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthKey,
          entrate: 0,
          uscite: 0,
          displayMonth: date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })
        };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].entrate += transaction.amount;
      } else {
        months[monthKey].uscite += transaction.amount;
      }
    });

    return Object.values(months).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [transactions, selectedYear, selectedCategory]);

  // Ottieni anni disponibili
  const availableYears = React.useMemo(() => {
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear().toString()))];
    return years.sort();
  }, [transactions]);

  // Ottieni categorie disponibili
  const availableCategories = React.useMemo(() => {
    return [...new Set(transactions.map(t => t.category))];
  }, [transactions]);

  const formatCurrency = (value: number) => 
    `€${value.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filtri */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-finance-blue" />
            Filtri Grafici
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Tipo Grafico
              </label>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Barre
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Linee
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Anno
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli anni</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Categoria
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grafico principale */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-finance-blue" />
            Andamento Mensile
            {selectedYear !== 'all' && <span className="text-sm font-normal">({selectedYear})</span>}
            {selectedCategory !== 'all' && <span className="text-sm font-normal">({selectedCategory})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="displayMonth" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="entrate" fill="#10b981" name="Entrate" />
                  <Bar dataKey="uscite" fill="#ef4444" name="Uscite" />
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="displayMonth" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="entrate" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Entrate"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uscite" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Uscite"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalCharts;
