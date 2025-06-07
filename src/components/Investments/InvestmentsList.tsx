
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
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
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            Nessun investimento trovato. Aggiungi il tuo primo investimento!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {investments.map((investment) => {
        const currentValue = calculateValue(investment);
        const pnl = calculatePnL(investment);
        const pnlPercentage = calculatePnLPercentage(investment);
        const investedValue = investment.quantity * investment.purchase_price;

        return (
          <Card key={investment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{investment.symbol}</h3>
                    <Badge variant="outline" className="text-xs">
                      {investment.quantity} azioni
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {investment.name}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Prezzo Acquisto</div>
                      <div className="font-medium">€{investment.purchase_price.toFixed(2)}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Prezzo Corrente</div>
                      <div className="font-medium">
                        {investment.current_price ? 
                          `€${investment.current_price.toFixed(2)}` : 
                          'Non disponibile'
                        }
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Valore Investito</div>
                      <div className="font-medium">€{investedValue.toFixed(2)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Valore Corrente</div>
                      <div className="font-medium">
                        {currentValue ? 
                          `€${currentValue.toFixed(2)}` : 
                          'Non disponibile'
                        }
                      </div>
                    </div>
                  </div>

                  {pnl !== null && pnlPercentage !== null && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className={`flex items-center gap-1 ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="font-medium">
                          {pnl >= 0 ? '+' : ''}€{pnl.toFixed(2)}
                        </span>
                        <span className="text-sm">
                          ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                        </span>
                      </div>
                      
                      {investment.change_percent !== null && (
                        <div className={`text-sm ${investment.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Oggi: {investment.change_percent >= 0 ? '+' : ''}{investment.change_percent.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Acquistato il: {new Date(investment.purchase_date).toLocaleDateString('it-IT')}
                    {investment.updated_at && (
                      <span className="ml-4">
                        Aggiornato: {new Date(investment.updated_at).toLocaleString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(investment.id, investment.symbol)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InvestmentsList;
