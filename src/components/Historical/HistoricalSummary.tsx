
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface ArchiveData {
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date: string;
    note?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
  }>;
  archived_at: string;
  archive_reason: string;
}

interface HistoricalSummaryProps {
  data: ArchiveData;
}

const HistoricalSummary: React.FC<HistoricalSummaryProps> = ({ data }) => {
  // Calcola totali delle entrate e delle uscite
  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calcola le top 5 categorie per entrate
  const incomeCategories = data.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topIncomeCategories = Object.entries(incomeCategories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Calcola le top 5 categorie per spese
  const expenseCategories = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topExpenseCategories = Object.entries(expenseCategories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Riepilogo Totali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Riepilogo Finanziario
          </CardTitle>
          <CardDescription>
            Totali del periodo archiviato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium">Entrate Totali</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium">Uscite Totali</span>
            </div>
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-brand-light/30 dark:bg-brand-primary/20 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-brand-primary mr-2" />
              <span className="font-medium">Bilancio Netto</span>
            </div>
            <span className={`text-xl font-bold ${
              totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top Categorie Entrate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Top Categorie Entrate
          </CardTitle>
          <CardDescription>
            Le 5 principali categorie di guadagno
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topIncomeCategories.length > 0 ? (
            topIncomeCategories.map(([category, amount], index) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{category}</span>
                  <span className="text-sm text-green-600 font-semibold">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(amount / totalIncome) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-gray-500 min-w-[40px]">
                    {formatPercentage(amount, totalIncome)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nessuna entrata nel periodo</p>
          )}
        </CardContent>
      </Card>

      {/* Top Categorie Spese */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            Top Categorie Spese
          </CardTitle>
          <CardDescription>
            Le 5 principali categorie di spesa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topExpenseCategories.length > 0 ? (
            topExpenseCategories.map(([category, amount], index) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{category}</span>
                  <span className="text-sm text-red-600 font-semibold">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(amount / totalExpenses) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-gray-500 min-w-[40px]">
                    {formatPercentage(amount, totalExpenses)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nessuna spesa nel periodo</p>
          )}
        </CardContent>
      </Card>

      {/* Statistiche Generali */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiche Periodo</CardTitle>
          <CardDescription>
            Informazioni generali sui dati archiviati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Totale Transazioni:</span>
            <span className="text-sm font-semibold">{data.transactions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Categorie Utilizzate:</span>
            <span className="text-sm font-semibold">{data.categories.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Data Archiviazione:</span>
            <span className="text-sm font-semibold">
              {new Date(data.archived_at).toLocaleDateString('it-IT')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Motivo Archiviazione:</span>
            <span className="text-sm font-semibold">
              {data.archive_reason === 'automatic_3_year_cleanup' ? 'Pulizia Automatica' : 'Manuale'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalSummary;
