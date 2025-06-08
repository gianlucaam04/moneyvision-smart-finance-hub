
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import type { ArchiveData } from '@/services/archivesService';

interface HistoricalSummaryProps {
  data: ArchiveData;
}

const HistoricalSummary: React.FC<HistoricalSummaryProps> = ({ data }) => {
  const { transactions, categories } = data;

  // Calcola totali
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Top categorie di spesa
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Top categorie di entrate
  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topIncomeCategories = Object.entries(incomeByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6366f1';
  };

  return (
    <div className="space-y-6">
      {/* Totali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entrate Totali</p>
                <p className="text-2xl font-bold text-green-600">
                  €{income.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uscite Totali</p>
                <p className="text-2xl font-bold text-red-600">
                  €{expenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bilancio</p>
                <p className={`text-2xl font-bold ${income - expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{(income - expenses).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Target className="w-8 h-8 text-finance-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiche generali */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-finance-blue" />
            Statistiche del Periodo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-finance-blue">{transactions.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transazioni</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-finance-blue">{categories.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categorie</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-finance-blue">
                €{transactions.length > 0 ? (expenses / transactions.filter(t => t.type === 'expense').length).toLocaleString('it-IT', { maximumFractionDigits: 0 }) : '0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spesa Media</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-finance-blue">
                €{transactions.length > 0 ? (income / transactions.filter(t => t.type === 'income').length).toLocaleString('it-IT', { maximumFractionDigits: 0 }) : '0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Entrata Media</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Categorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spese */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Top 5 Categorie di Spesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenseCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: getCategoryColor(category) + '20', color: getCategoryColor(category) }}
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{category}</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    €{amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Entrate */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top 5 Categorie di Entrata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIncomeCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: getCategoryColor(category) + '20', color: getCategoryColor(category) }}
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{category}</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    €{amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoricalSummary;
