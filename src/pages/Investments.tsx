
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, Target, Activity, BarChart3, PieChart, Download, Zap, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import InvestmentForm from '@/components/Investments/InvestmentForm';
import InvestmentsList from '@/components/Investments/InvestmentsList';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

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
      toast.success('Prezzi aggiornati!');
    } catch (error) {
      console.error('Errore aggiornamento prezzi:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'aggiornamento dei prezzi';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const exportPortfolio = () => {
    const portfolioData = {
      investments,
      summary: calculateTotalValues(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Portfolio esportato!');
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Caricamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <Layout>
        <div className="space-y-4">
          {/* Mobile Header compatto */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">💼 Investimenti</h1>
                <p className="text-blue-100 text-sm">Il tuo portafoglio</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuovo Investimento</DialogTitle>
                  </DialogHeader>
                  <InvestmentForm hideTrigger onInvestmentAdded={loadInvestments} />
                </DialogContent>
              </Dialog>
            </div>
            
            {investments.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-200">Investito</div>
                  <div className="text-lg font-bold">€{totalInvested.toLocaleString('it-IT')}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs text-blue-200">Valore</div>
                  <div className="text-lg font-bold">€{totalCurrent.toLocaleString('it-IT')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Azioni rapide mobile */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleUpdatePrices}
              disabled={isUpdatingPrices || investments.length === 0}
              className="h-12"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
            <Button 
              onClick={exportPortfolio}
              disabled={investments.length === 0}
              variant="outline"
              className="h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
          </div>

          {/* P&L compatto */}
          {investments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">P&L Totale</div>
                  <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnL >= 0 ? '+' : ''}€{totalPnL.toLocaleString('it-IT')}
                  </div>
                  <div className={`text-sm ${totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista investimenti compatta */}
          <InvestmentsList 
            investments={investments} 
            onInvestmentDeleted={loadInvestments}
          />

          {/* Analisi AI compatta */}
          {investments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Analisi AI
                  <Zap className="w-4 h-4 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Analisi in corso...</p>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {analysis || 'Clicca per generare un\'analisi del portafoglio'}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    );
  }

  // Desktop Layout - Versione semplificata
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header desktop semplificato */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">
                      💼 Portafoglio Investimenti
                    </h1>
                    <p className="text-blue-100 text-lg mt-1">
                      Monitora e gestisci i tuoi investimenti in tempo reale
                    </p>
                  </div>
                </div>
                
                {investments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-sm text-blue-200">Investito</div>
                      <div className="text-xl font-bold">€{totalInvested.toLocaleString('it-IT')}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-sm text-blue-200">Valore Attuale</div>
                      <div className="text-xl font-bold">€{totalCurrent.toLocaleString('it-IT')}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-sm text-blue-200">P&L</div>
                      <div className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {totalPnL >= 0 ? '+' : ''}€{totalPnL.toLocaleString('it-IT')}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-sm text-blue-200">Performance</div>
                      <div className={`text-xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleUpdatePrices}
                  disabled={isUpdatingPrices || investments.length === 0}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
                  {isUpdatingPrices ? 'Aggiornamento...' : 'Aggiorna Prezzi'}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Nuovo Investimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Aggiungi Investimento</DialogTitle>
                    </DialogHeader>
                    <InvestmentForm hideTrigger onInvestmentAdded={loadInvestments} />
                  </DialogContent>
                </Dialog>
                
                {investments.length > 0 && (
                  <Button 
                    onClick={exportPortfolio}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Esporta Portfolio
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifica API con design migliorato */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  ⚠️ Informazioni sui Prezzi di Mercato
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  I prezzi vengono aggiornati tramite API esterna (Finnhub). In caso di limitazioni del servizio, 
                  i prezzi potrebbero non essere sempre aggiornati in tempo reale. Ultimo aggiornamento disponibile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs semplificate */}
        <Tabs value={selectedTab} onValueChange={val => setSelectedTab(val as 'portfolio'|'analytics')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio">
              <Target className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analisi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <InvestmentsList 
              investments={investments} 
              onInvestmentDeleted={loadInvestments}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-0 shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                      <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        🤖 Analisi Portafoglio AI
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Insights intelligenti sui tuoi investimenti powered by AI
                      </p>
                    </div>
                  </div>
                  {investments.length > 0 && (
                    <div className="text-right">
                      <Badge variant="outline" className="bg-white/50">
                        {investments.length} asset in portafoglio
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="space-y-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <Target className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Nessun investimento nel portafoglio
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                          Aggiungi alcuni investimenti per vedere l'analisi del portafoglio generata dall'intelligenza artificiale
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Aggiungi Primo Investimento
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
                ) : isAnalyzing ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          🧠 Analisi del portafoglio in corso...
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          L'AI sta elaborando i tuoi investimenti
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-8 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 backdrop-blur-sm">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                          {analysis || 'Nessuna analisi disponibile per il tuo portafoglio.'}
                        </div>
                      </div>
                    </div>
                    {analysis && (
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <PieChart className="w-4 h-4" />
                        <span>Analisi generata tramite intelligenza artificiale</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                          <Zap className="w-3 h-3 mr-1" />
                          AI Powered
                        </Badge>
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
