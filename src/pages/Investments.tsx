
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Layout/Header';
import InvestmentForm from '@/components/Investments/InvestmentForm';
import InvestmentsList from '@/components/Investments/InvestmentsList';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  const loadInvestments = async () => {
    try {
      const data = await investmentsService.getUserInvestments();
      setInvestments(data);
    } catch (error) {
      toast.error('Errore nel caricamento degli investimenti');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrices = async () => {
    if (investments.length === 0) {
      toast.info('Nessun investimento da aggiornare');
      return;
    }

    setIsUpdatingPrices(true);
    try {
      const updatedInvestments = await investmentsService.updateCurrentPrices(investments);
      setInvestments(updatedInvestments);
      toast.success('Prezzi aggiornati con successo!');
    } catch (error) {
      toast.error('Errore nell\'aggiornamento dei prezzi');
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const calculateTotalValues = () => {
    const totalInvested = investments.reduce((sum, inv) => 
      sum + (inv.quantity * inv.purchase_price), 0
    );
    
    const totalCurrent = investments.reduce((sum, inv) => 
      sum + (inv.current_price ? inv.quantity * inv.current_price : inv.quantity * inv.purchase_price), 0
    );
    
    const totalPnL = totalCurrent - totalInvested;
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalPnL, totalPnLPercentage };
  };

  const { totalInvested, totalCurrent, totalPnL, totalPnLPercentage } = calculateTotalValues();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Caricamento investimenti...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              I Miei Investimenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitora e gestisci il tuo portafoglio di investimenti
            </p>
          </div>
          
          <Button 
            onClick={handleUpdatePrices}
            disabled={isUpdatingPrices || investments.length === 0}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
            {isUpdatingPrices ? 'Aggiornamento...' : 'Aggiorna Prezzi'}
          </Button>
        </div>

        {/* Riepilogo Portfolio */}
        {investments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valore Investito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">€{totalInvested.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valore Corrente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">€{totalCurrent.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  P&L Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {totalPnL >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnL >= 0 ? '+' : ''}€{totalPnL.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Performance %
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {totalPnLPercentage >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={`text-2xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <InvestmentForm onInvestmentAdded={loadInvestments} />
        
        <InvestmentsList 
          investments={investments} 
          onInvestmentDeleted={loadInvestments}
        />
      </main>
    </div>
  );
};

export default Investments;
