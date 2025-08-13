import 'together-ai/shims/web';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, Target, Activity, BarChart3, PieChart, Download, Zap, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import InvestmentForm from '@/components/Investments/InvestmentForm';
import InvestmentsList from '@/components/Investments/InvestmentsList';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import Together from 'together-ai';

const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY as string | undefined;
const TOGETHER_MODEL = (import.meta.env.VITE_TOGETHER_MODEL as string | undefined) || 'meta-llama/Llama-3.1-8B-Instruct-Turbo';
const together: Together | null = TOGETHER_API_KEY ? new Together({ apiKey: TOGETHER_API_KEY }) : null;
if (!TOGETHER_API_KEY) {
  console.warn('VITE_TOGETHER_API_KEY mancante, analisi disabilitata');
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  type AnalysisJSON = { performance: string; risk: string; actions: string[] };
  const [analysisJson, setAnalysisJson] = useState<AnalysisJSON | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Helpers per UI analisi
  const getPerfIsPositive = (perf?: string) => (perf ?? '').includes('+') && !(perf ?? '').includes('-');
  const getRiskLevel = (risk?: string) => {
    const r = (risk ?? '').toLowerCase();
    if (/(elevat|alto|rischio|correzz?ione|drawdown|ribasso|volatil|attenzione)/i.test(r)) return 'amber';
    if (/(critico|severo|allerta|perdita)/i.test(r)) return 'red';
    return 'green';
  };

  const runAnalysis = async () => {
    if (isAnalyzing) return; // prevent concurrent runs
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const seconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      toast.info(`Attendi ${seconds}s prima di riprovare (rate limit)`);
      return;
    }
    if (investments.length === 0) {
      toast.info('Aggiungi investimenti per generare un\'analisi');
      return;
    }
    setIsAnalyzing(true);
    try {
      const summary = investments.map(inv =>
        `${inv.symbol}: acquistati ${inv.quantity} a €${inv.purchase_price.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}, prezzo corrente ${inv.current_price ? `€${inv.current_price.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}` : 'N/A'}`
      ).join('; ');
      const systemPrompt = `Sei un assistente che restituisce SOLO JSON valido e minificato (una sola riga), senza testo extra prima o dopo.
Schema JSON richiesto:
{
  "performance": string,  // es: "+250% (€175,12 - €50,00)"
  "risk": string,         // 1 riga
  "actions": string[]     // 2-3 voci, frasi brevi all'imperativo
}
Esempio di output:
{"performance":"+250% (€175,12 - €50,00)","risk":"Attenzione: possibile correzione dopo rialzo rapido.","actions":["Monitora eventuali segnali di ribasso","Valuta presa di profitto parziale","Evita nuovi acquisti finché il prezzo non si stabilizza"]}`;
      const userPrompt = `Analizza questi investimenti e restituisci SOLO il JSON nel formato indicato, senza altro testo: ${summary}`;
      if (together) {
        const response = await together.chat.completions.create({
          model: TOGETHER_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        });
        const content = (response.choices[0].message.content || '').trim();
        // Prova a fare il parse del JSON; se fallisce, mostra testo grezzo
        try {
          const obj = JSON.parse(content) as AnalysisJSON;
          // sanity check
          if (obj && typeof obj.performance === 'string' && typeof obj.risk === 'string' && Array.isArray(obj.actions)) {
            setAnalysisJson(obj);
            setAnalysis('');
          } else {
            setAnalysis(content);
            setAnalysisJson(null);
          }
        } catch {
          setAnalysis(content);
          setAnalysisJson(null);
        }
      } else {
        setAnalysis('Analisi disabilitata: configura VITE_TOGETHER_API_KEY nel file .env');
        toast.error('Chiave Together AI mancante');
      }
    } catch (error) {
      console.error('Errore analisi AI:', error);
      // Handle Together model-specific rate limits
      try {
        type TogetherErrorShape = { error?: { type?: string } ; type?: string };
        let detectedType: string | undefined;
        const errObj: unknown = typeof error === 'string' ? JSON.parse(error) : error;
        if (errObj && typeof errObj === 'object') {
          const e = errObj as TogetherErrorShape;
          detectedType = e.error?.type ?? e.type;
        }
        if (detectedType === 'model_rate_limit') {
          setCooldownUntil(Date.now() + 60_000); // 60s cooldown
          toast.error('Limite di richieste del modello raggiunto. Riprova tra 60 secondi o scegli un modello diverso.');
        }
      } catch (parseErr) {
        console.debug('Impossibile analizzare l\'errore Together AI:', parseErr);
      }
      const msg = error instanceof Error ? error.message : 'Errore nell\'analisi del portafoglio';
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  // Rimuoviamo l'auto-run per evitare loop o rate limit accidentali.
  // L'analisi viene avviata dal pulsante "Genera Analisi".

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
        <div className="space-y-4 px-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-blue-200">Investito</div>
                  <div className="text-base font-semibold">€{totalInvested.toLocaleString('it-IT')}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-blue-200">Valore</div>
                  <div className="text-base font-semibold">€{totalCurrent.toLocaleString('it-IT')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Azioni rapide mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleUpdatePrices}
              disabled={isUpdatingPrices || investments.length === 0}
              className="h-11 w-full"
            >
              <RefreshCw className={`${isUpdatingPrices ? 'animate-spin' : ''} w-4 h-4 mr-2`} />
              Aggiorna
            </Button>
            <Button 
              onClick={exportPortfolio}
              disabled={investments.length === 0}
              variant="outline"
              className="h-11 w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
          </div>

          {/* P&L compatto */}
          {investments.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">P&L Totale</div>
                  <div className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnL >= 0 ? '+' : ''}€{totalPnL.toLocaleString('it-IT')}
                  </div>
                  <div className={`text-xs ${totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                  <>
                    {analysisJson ? (
                      <div className="space-y-4">
                        {/* KPI Performance + Risk chip */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className={`flex-1 rounded-xl p-4 border ${getPerfIsPositive(analysisJson.performance) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/40' : 'bg-red-50 dark:bg-red-900/20 border-red-200/60 dark:border-red-800/40'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getPerfIsPositive(analysisJson.performance) ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                                {getPerfIsPositive(analysisJson.performance) ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className={`text-xs uppercase tracking-wide ${getPerfIsPositive(analysisJson.performance) ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-red-700/80 dark:text-red-300/80'}`}>Performance</div>
                                <div className={`text-lg font-semibold ${getPerfIsPositive(analysisJson.performance) ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>{analysisJson.performance}</div>
                              </div>
                            </div>
                          </div>
                          {(() => {
                            const level = getRiskLevel(analysisJson.risk);
                            const cfg = level === 'red' ? {wrap:'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', dot:'bg-red-500', title:'text-red-700 dark:text-red-300', text:'text-red-800 dark:text-red-200'} : level === 'amber' ? {wrap:'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', dot:'bg-amber-500', title:'text-amber-700 dark:text-amber-300', text:'text-amber-800 dark:text-amber-200'} : {wrap:'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', dot:'bg-emerald-500', title:'text-emerald-700 dark:text-emerald-300', text:'text-emerald-800 dark:text-emerald-200'};
                            return (
                              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${cfg.wrap}`}>
                                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${cfg.dot} shadow-[0_0_0_3px_rgba(0,0,0,0.06)]`} />
                                <div>
                                  <div className={`text-xs uppercase tracking-wide ${cfg.title}`}>Rischio</div>
                                  <div className={`text-sm font-medium ${cfg.text}`}>{analysisJson.risk}</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Actions */}
                        <div className="rounded-xl p-4 bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/60 backdrop-blur">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-gray-900 dark:text-white">Azioni consigliate</div>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800">
                              <Zap className="w-3.5 h-3.5 mr-1" /> AI
                            </Badge>
                          </div>
                          <ul className="space-y-2">
                            {analysisJson.actions.map((a, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-4.5 h-4.5 text-purple-600 mt-0.5" />
                                <span className="text-gray-800 dark:text-gray-200">{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Footer note */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-purple-500" />
                          Suggerimenti generati automaticamente. Effettua sempre verifiche personali.
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        {analysis || 'Clicca il pulsante per generare un\'analisi del portafoglio'}
                      </div>
                    )}
                    <div className="mt-3">
                      <Button onClick={runAnalysis} className="w-full">Genera Analisi</Button>
                    </div>
                  </>
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

        {/* Desktop: niente tabs, contenuti diretti */}
        <div className="space-y-6">
          <InvestmentsList 
            investments={investments} 
            onInvestmentDeleted={loadInvestments}
          />

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
                  <div className="flex justify-end">
                    <Button onClick={runAnalysis} variant="outline">
                      <Zap className="w-4 h-4 mr-2" /> Genera Analisi
                    </Button>
                  </div>
                  <div className="p-8 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 backdrop-blur-sm">
                    {analysisJson ? (
                      <div className="space-y-3 text-gray-800 dark:text-gray-200">
                        <div><span className="font-semibold">Performance:</span> {analysisJson.performance}</div>
                        <div><span className="font-semibold">Rischio:</span> {analysisJson.risk}</div>
                        <div>
                          <div className="font-semibold">Azioni consigliate:</div>
                          <ul className="list-disc ml-6 mt-1 space-y-1">
                            {analysisJson.actions.map((a, idx) => (
                              <li key={idx}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                          {analysis || 'Nessuna analisi disponibile per il tuo portafoglio.'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Investments;
