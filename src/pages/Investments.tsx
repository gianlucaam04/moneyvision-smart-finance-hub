
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finance-blue mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400">Caricamento investimenti...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-finance-blue to-blue-600 bg-clip-text text-transparent">
              Portafoglio Investimenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Monitora e gestisci i tuoi investimenti in tempo reale
            </p>
          </div>
          
          <Button 
            onClick={handleUpdatePrices}
            disabled={isUpdatingPrices || investments.length === 0}
            className="bg-finance-blue hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
            {isUpdatingPrices ? 'Aggiornamento...' : 'Aggiorna Prezzi'}
          </Button>
        </div>

        {/* Portfolio Summary Cards */}
        {investments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Valore Investito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      €{totalInvested.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Valore Corrente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      €{totalCurrent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  {totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  P&L Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {totalPnL >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <span className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {totalPnL >= 0 ? '+' : ''}€{totalPnL.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  {totalPnLPercentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  Performance %
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${totalPnLPercentage >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {totalPnLPercentage >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <span className={`text-2xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Investment Form */}
        <div className="space-y-6">
          <InvestmentForm onInvestmentAdded={loadInvestments} />
          
          {/* Investments List */}
          <InvestmentsList 
            investments={investments} 
            onInvestmentDeleted={loadInvestments}
          />
        </div>
      </main>
    </div>
  );
};

export default Investments;
