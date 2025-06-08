
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ArchiveData } from '@/services/archivesService';

interface HistoricalSummaryProps {
  data: ArchiveData;
}

const HistoricalSummary: React.FC<HistoricalSummaryProps> = ({ data }) => {
  // Calcola statistiche dai dati storici
  const calculateStats = () => {
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const netAmount = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, netAmount };
  };

  // Trova le top categorie
  const getTopCategories = (type: 'income' | 'expense') => {
    const categoryTotals = data.transactions
      .filter(t => t.type === type)
      .reduce((acc, t) => {
        const category = t.category || 'Altro';
        acc[category] = (acc[category] || 0) + Number(t.amount || 0);
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
  };

  // Calcola periodo dei dati
  const getPeriod = () => {
    const dates = data.transactions.map(t => new Date(t.date)).sort();
    if (dates.length === 0) return { start: '', end: '' };
    
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    return {
      start: start.toLocaleDateString('it-IT'),
      end: end.toLocaleDateString('it-IT')
    };
  };

  const stats = calculateStats();
  const topIncomeCategories = getTopCategories('income');
  const topExpenseCategories = getTopCategories('expense');
  const period = getPeriod();

  return (
    <div className="space-y-6">
      {/* Periodo e Statistiche Principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Periodo</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {period.start} - {period.end}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entrate</p>
                <p className="text-lg font-semibold text-green-600">
                  €{stats.totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <p className="text-lg font-semibold text-red-600">
                  €{stats.totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.netAmount >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <DollarSign className={`w-5 h-5 ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo</p>
                <p className={`text-lg font-semibold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{stats.netAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 5 Categorie Entrate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIncomeCategories.length > 0 ? (
              topIncomeCategories.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    €{item.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nessuna categoria di entrata trovata
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Top 5 Categorie Uscite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topExpenseCategories.length > 0 ? (
              topExpenseCategories.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    €{item.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nessuna categoria di uscita trovata
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informazioni Archivio */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informazioni Archivio
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Totale Transazioni</p>
              <p className="text-xl font-bold text-blue-600">{data.transactions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Data Archiviazione</p>
              <p className="text-xl font-bold text-blue-600">
                {new Date(data.archived_at).toLocaleDateString('it-IT')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Motivo</p>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                {data.archive_reason === 'automatic_3_year_cleanup' ? 'Pulizia automatica 3 anni' : data.archive_reason}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalSummary;
