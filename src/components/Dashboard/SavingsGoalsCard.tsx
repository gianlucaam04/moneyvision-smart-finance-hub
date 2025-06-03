
import React from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SavingsGoalsCard: React.FC = () => {
  const { savingsGoals } = useFinance();
  const navigate = useNavigate();

  const activeGoals = savingsGoals.filter(goal => !goal.isCompleted).slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Obiettivi di Risparmio</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/goals')}
          className="hover:bg-finance-green hover:text-white transition-colors duration-200"
        >
          Gestisci
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2 block">🎯</span>
            <p>Nessun obiettivo attivo</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate('/goals')}
            >
              Crea il primo obiettivo
            </Button>
          </div>
        ) : (
          activeGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2"
                  style={{ 
                    background: `linear-gradient(to right, ${goal.color} 0%, ${goal.color}40 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{progress.toFixed(1)}% completato</span>
                  <span>Scadenza: {new Date(goal.deadline).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsGoalsCard;
