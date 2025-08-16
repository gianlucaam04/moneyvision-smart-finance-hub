
import React from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RecentTransactions: React.FC = () => {
  const { transactions } = useFinance();
  const navigate = useNavigate();

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Transazioni Recenti</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/transactions')}
          className="hover:bg-brand-primary hover:text-white transition-colors duration-200"
        >
          Vedi tutte
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden w-full">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2 block">📝</span>
            <p>Nessuna transazione recente</p>
          </div>
        ) : (
          recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 overflow-hidden w-full"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  transaction.type === 'income' ? 'bg-success' : 'bg-expense'
                }`} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {transaction.category} • {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className={`font-semibold ${
                transaction.type === 'income' ? 'text-success' : 'text-expense'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
