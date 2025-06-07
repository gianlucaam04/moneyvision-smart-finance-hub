import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import InvestmentForm from '@/components/Investments/InvestmentForm';
import InvestmentsList from '@/components/Investments/InvestmentsList';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

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
      console.error('Errore aggiornamento prezzi:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'aggiornamento dei prezzi';
      toast.error(errorMessage);
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
      <main className="container mx-auto px-4 py-8 space-y-8 pb-24">
        
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
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleUpdatePrices}
              disabled={isUpdatingPrices || investments.length === 0}
              className="flex-1 whitespace-normal bg-finance-blue hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
              {isUpdatingPrices ? 'Aggiornamento...' : 'Aggiorna Prezzi'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 whitespace-normal bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Aggiungi Investimento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi Investimento</DialogTitle>
                </DialogHeader>
                <InvestmentForm hideTrigger onInvestmentAdded={loadInvestments} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* API Status Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 dark:text-amber-400 mt-0.5">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Nota sui prezzi di mercato
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                I prezzi vengono aggiornati tramite API esterna. In caso di limitazioni del servizio, 
                i prezzi potrebbero non essere sempre aggiornati in tempo reale.
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {investments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {/* Tabs Section */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Portafoglio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analisi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6 mt-6">
            <div className="overflow-x-auto w-full">
              <InvestmentsList 
                investments={investments} 
                onInvestmentDeleted={loadInvestments}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Analisi Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investments.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuzione Asset</h3>
                        <div className="space-y-3">
                          {investments.map((investment, index) => {
                            const percentage = ((investment.quantity * investment.purchase_price) / totalInvested) * 100;
                            return (
                              <div key={investment.id} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {investment.symbol}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-finance-blue h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance per Asset</h3>
                        <div className="space-y-3">
                          {investments.map((investment) => {
                            const currentValue = investment.current_price ? investment.quantity * investment.current_price : null;
                            const investedValue = investment.quantity * investment.purchase_price;
                            const pnl = currentValue ? currentValue - investedValue : null;
                            const pnlPercentage = pnl ? (pnl / investedValue) * 100 : null;
                            
                            return (
                              <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {investment.symbol}
                                </span>
                                {pnlPercentage !== null ? (
                                  <div className={`flex items-center gap-1 ${pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {pnlPercentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="text-sm font-medium">
                                      {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">N/A</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Aggiungi dei investimenti per visualizzare le analisi del portafoglio
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50 shadow-lg">
        <Navigation />
      </nav>
    </div>
  );
};

export default Investments;
