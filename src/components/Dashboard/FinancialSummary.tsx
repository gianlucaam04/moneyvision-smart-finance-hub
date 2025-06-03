
import React from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const FinancialSummary: React.FC = () => {
  const { summary } = useFinance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getTrendIcon = () => {
    switch (summary.monthlyTrend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-expense" />;
      default:
        return <span className="text-2xl">📈</span>;
    }
  };

  const getTrendEmoji = () => {
    switch (summary.monthlyTrend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Entrate */}
      <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20 hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Entrate Mensili
          </CardTitle>
          <div className="p-2 bg-success/10 rounded-full">
            <span className="text-xl">💰</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(summary.totalIncome)}
            </div>
            <span className="text-lg">{getTrendEmoji()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Uscite */}
      <Card className="bg-gradient-to-r from-expense/10 to-expense/5 border-expense/20 hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Spese Mensili
          </CardTitle>
          <div className="p-2 bg-expense/10 rounded-full">
            <span className="text-xl">💸</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <span className="text-lg">{getTrendEmoji()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bilancio */}
      <Card className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-success/10 to-success/5 border-success/20' : 'from-expense/10 to-expense/5 border-expense/20'} hover:shadow-lg transition-all duration-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bilancio
          </CardTitle>
          <div className={`p-2 ${summary.balance >= 0 ? 'bg-success/10' : 'bg-expense/10'} rounded-full`}>
            {getTrendIcon()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-success' : 'text-expense'}`}>
              {formatCurrency(summary.balance)}
            </div>
            <span className="text-lg">{getTrendEmoji()}</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Budget utilizzato: {summary.budgetUsage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  summary.budgetUsage > 100 ? 'bg-expense' : 
                  summary.budgetUsage > 80 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(summary.budgetUsage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
