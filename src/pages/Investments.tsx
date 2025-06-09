
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, TrendingDown, Target, Activity, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import InvestmentForm from '@/components/Investments/InvestmentForm';
import InvestmentsList from '@/components/Investments/InvestmentsList';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Together from 'together-ai';

const TOGETHER_API_KEY = '3e5e74406a4de464802163316677abf0b8fae098ac9d23ad1df8fee3a48eb45f';
let together: Together | null = null;
if (TOGETHER_API_KEY) {
  together = new Together({ apiKey: TOGETHER_API_KEY });
} else {
  console.warn('TOGETHER_API_KEY mancante, analisi disabilitata');
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'portfolio'|'analytics'>('portfolio');
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

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

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (selectedTab !== 'analytics' || investments.length === 0) return;
      setIsAnalyzing(true);
      try {
        const summary = investments.map(inv =>
          `${inv.symbol}: acquistati ${inv.quantity} a €${inv.purchase_price.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}, prezzo corrente ${inv.current_price ? `€${inv.current_price.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}` : 'N/A'}`
        ).join('; ');
        const prompt = `Analizza il mio portafoglio basandoti sui seguenti investimenti: ${summary}. Fornisci un commento sintetico sulle performance e eventuali suggerimenti.`;
        if (together) {
          const response = await together.chat.completions.create({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
            messages: [{ role: 'user', content: prompt }]
          });
          setAnalysis(response.choices[0].message.content || '');
        } else {
          setAnalysis('Analisi disabilitata a causa della mancanza di VITE_TOGETHER_API_KEY');
        }
      } catch (error) {
        console.error('Errore analisi AI:', error);
        toast.error('Errore nell\'analisi del portafoglio');
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAnalysis();
  }, [selectedTab, investments]);

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
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finance-blue mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento investimenti...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
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

        {/* Riepilogo Portafoglio */}
        {investments.length > 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Riepilogo Portafoglio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Investito</div>
                    <div className="font-semibold text-gray-900 dark:text-white">€{totalInvested.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Corrente</div>
                    <div className="font-semibold text-gray-900 dark:text-white">€{totalCurrent.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {totalPnL >= 0 ? <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />}
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">P&L</div>
                    <div className={`font-semibold ${totalPnL>=0? 'text-green-600':'text-red-600'}`}>{totalPnL>=0? '+' : ''}€{totalPnL.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {totalPnLPercentage >= 0 ? <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />}
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Perf %</div>
                    <div className={`font-semibold ${totalPnLPercentage>=0? 'text-green-600':'text-red-600'}`}>{totalPnLPercentage>=0? '+' : ''}{totalPnLPercentage.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={val => setSelectedTab(val as 'portfolio'|'analytics')} className="w-full">
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
            <div className="w-full">
              <InvestmentsList 
                investments={investments} 
                onInvestmentDeleted={loadInvestments}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 dark:from-blue-900/20 dark:to-green-900/20 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <PieChart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        Analisi Portafoglio AI
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Insights intelligenti sui tuoi investimenti
                      </p>
                    </div>
                  </div>
                  {investments.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {investments.length} asset in portafoglio
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center">
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Nessun investimento nel portafoglio
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Aggiungi alcuni investimenti per vedere l'analisi del portafoglio
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Analisi del portafoglio in corso...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {analysis || 'Nessuna analisi disponibile per il tuo portafoglio.'}
                        </div>
                      </div>
                    </div>
                    {analysis && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <PieChart className="w-3 h-3" />
                        <span>Analisi generata tramite intelligenza artificiale</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Investments;
