
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { toast } from 'sonner';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';

interface InvestmentsListProps {
  investments: Investment[];
  onInvestmentDeleted: () => void;
}

const InvestmentsList: React.FC<InvestmentsListProps> = ({ 
  investments, 
  onInvestmentDeleted 
}) => {
  const handleDelete = async (id: string, symbol: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'investimento ${symbol}?`)) {
      return;
    }

    try {
      await investmentsService.deleteInvestment(id);
      toast.success('Investimento eliminato con successo');
      onInvestmentDeleted();
    } catch (error) {
      toast.error('Errore nell\'eliminazione dell\'investimento');
    }
  };

  const calculateValue = (investment: Investment) => {
    if (!investment.current_price) return null;
    return investment.quantity * investment.current_price;
  };

  const calculatePnL = (investment: Investment) => {
    if (!investment.current_price) return null;
    const currentValue = investment.quantity * investment.current_price;
    const investedValue = investment.quantity * investment.purchase_price;
    return currentValue - investedValue;
  };

  const calculatePnLPercentage = (investment: Investment) => {
    if (!investment.current_price) return null;
    const currentValue = investment.quantity * investment.current_price;
    const investedValue = investment.quantity * investment.purchase_price;
    return ((currentValue - investedValue) / investedValue) * 100;
  };

  if (investments.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nessun investimento</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Inizia a costruire il tuo portafoglio aggiungendo il primo investimento!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-finance-blue/10 rounded-lg">
          <Target className="w-5 h-5 text-finance-blue" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">I Tuoi Investimenti</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {investments.length} {investments.length === 1 ? 'investimento' : 'investimenti'} nel portafoglio
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {investments.map((investment) => {
          const currentValue = calculateValue(investment);
          const pnl = calculatePnL(investment);
          const pnlPercentage = calculatePnLPercentage(investment);
          const investedValue = investment.quantity * investment.purchase_price;

          return (
            <Card key={investment.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{investment.symbol}</h3>
                        <Badge variant="outline" className="text-xs bg-finance-blue/10 text-finance-blue border-finance-blue/20">
                          {investment.quantity} {investment.quantity === 1 ? 'azione' : 'azioni'}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                      {investment.name}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Prezzo Acquisto</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          €{investment.purchase_price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Prezzo Corrente</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {investment.current_price ? 
                            `€${investment.current_price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                            'Non disponibile'
                          }
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Valore Investito</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          €{investedValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Valore Corrente</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {currentValue ? 
                            `€${currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                            'Non disponibile'
                          }
                        </div>
                      </div>
                    </div>

                    {pnl !== null && pnlPercentage !== null && (
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${pnl >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                          {pnl >= 0 ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-600" />}
                          <span className={`font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {pnl >= 0 ? '+' : ''}€{pnl.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className={`text-sm ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                          </span>
                        </div>
                        
                        {investment.change_percent !== null && (
                          <div className={`text-sm flex items-center gap-1 ${investment.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Oggi:</span>
                            <span className="font-medium">
                              {investment.change_percent >= 0 ? '+' : ''}{investment.change_percent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Acquistato il: {new Date(investment.purchase_date).toLocaleDateString('it-IT')}</span>
                      </div>
                      {investment.updated_at && (
                        <div className="flex items-center gap-1">
                          <span>Aggiornato: {new Date(investment.updated_at).toLocaleString('it-IT')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(investment.id, investment.symbol)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InvestmentsList;
