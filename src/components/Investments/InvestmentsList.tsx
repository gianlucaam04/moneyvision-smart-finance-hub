import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { toast } from 'sonner';
import { investmentsService } from '@/services/investmentsService';
import type { Investment } from '@/types/investments';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface InvestmentsListProps {
  investments: Investment[];
  onInvestmentDeleted: () => void;
  onEdit?: (investment: Investment) => void;
}

const InvestmentsList: React.FC<InvestmentsListProps> = ({ 
  investments, 
  onInvestmentDeleted,
  onEdit
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<{ id: string; symbol: string } | null>(null);
  const [dcaOpenId, setDcaOpenId] = useState<string | null>(null);
  const [dcaForm, setDcaForm] = useState<{ amount: string; price: string; date: string; note: string }>({
    amount: '', price: '', date: new Date().toISOString().split('T')[0], note: ''
  });
  // Helpers UI
  const getPnLClasses = (value: number) => value >= 0
    ? { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600', border: 'border-green-200/60 dark:border-green-800/40' }
    : { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', border: 'border-red-200/60 dark:border-red-800/40' };

  const clampPct = (pct: number) => Math.max(-100, Math.min(100, pct));
  const confirmDelete = async () => {
    if (!investmentToDelete) return;
    try {
      await investmentsService.deleteInvestment(investmentToDelete.id);
      toast.success('Investimento eliminato con successo');
      onInvestmentDeleted();
    } catch (error) {
      toast.error("Errore nell'eliminazione dell'investimento");
    } finally {
      setDeleteOpen(false);
      setInvestmentToDelete(null);
    }
  };

  const openDcaDialog = (inv: Investment) => {
    setDcaOpenId(inv.id);
    setDcaForm({
      amount: inv.dca_amount != null ? String(inv.dca_amount) : '',
      price: inv.current_price != null ? String(inv.current_price) : '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  const submitDca = async () => {
    if (!dcaOpenId) return;
    const amount = parseFloat(dcaForm.amount);
    const price = parseFloat(dcaForm.price);
    const date = dcaForm.date;
    if (!(amount > 0) || !(price > 0) || !date) {
      toast.error('Compila importo, prezzo e data validi');
      return;
    }
    try {
      await investmentsService.addDcaContribution(dcaOpenId, { amount, price, date, note: dcaForm.note || undefined });
      toast.success('Rata PAC registrata');
      setDcaOpenId(null);
      onInvestmentDeleted(); // riusa callback per ricaricare lista
    } catch (e) {
      toast.error('Errore nella registrazione della rata');
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
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    {/* Header simbolo + quantità + badge prezzo corrente */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">{investment.symbol}</h3>
                      <Badge variant="outline" className="text-xs bg-finance-blue/10 text-finance-blue border-finance-blue/20">
                        {investment.quantity} {investment.quantity === 1 ? 'azione' : 'azioni'}
                      </Badge>
                      {investment.current_price && (
                        <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800">
                          €{investment.current_price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium break-words line-clamp-1 sm:line-clamp-none">
                      {investment.name}
                    </p>

                    {/* KPI grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Prezzo Acquisto</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          €{investment.purchase_price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Prezzo Corrente</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {investment.current_price ? `€${investment.current_price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Non disponibile'}
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
                          {currentValue ? `€${currentValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Non disponibile'}
                        </div>
                      </div>
                    </div>

                    {/* PnL area */}
                    {pnl !== null && pnlPercentage !== null && (() => {
                      const cls = getPnLClasses(pnl);
                      const pct = clampPct(pnlPercentage);
                      const pctAbs = Math.abs(pct);
                      return (
                        <div className="space-y-2">
                          <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cls.bg} ${cls.border}`}>
                            <div className="flex items-center gap-2">
                              {pnl >= 0 ? <TrendingUp size={16} className={cls.text} /> : <TrendingDown size={16} className={cls.text} />}
                              <span className={`font-semibold ${cls.text}`}>
                                {pnl >= 0 ? '+' : ''}€{pnl.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className={`text-sm ${cls.text}`}>
                                ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                              </span>
                            </div>
                            {investment.change_percent !== null && (
                              <div className={`text-sm font-medium ${investment.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Oggi {investment.change_percent >= 0 ? '+' : ''}{investment.change_percent.toFixed(2)}%
                              </div>
                            )}
                          </div>
                          {/* progress bar */}
                          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={`h-full ${pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${pctAbs}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Meta */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit ? onEdit(investment) : null}
                      className="text-brand-primary hover:text-brand-primary/80 hover:bg-brand-light/30 dark:hover:bg-brand-primary/20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 h-9 w-9 p-0"
                      aria-label="Modifica investimento"
                    >
                      <TrendingUp size={16} />
                    </Button>
                    {investment.dca_enabled && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDcaDialog(investment)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 h-9 w-9 p-0"
                          aria-label="Registra rata PAC"
                        >
                          <Calendar size={16} />
                        </Button>
                        <Dialog open={dcaOpenId === investment.id} onOpenChange={(v) => { if (!v) setDcaOpenId(null); }}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Registra rata PAC — {investment.symbol}</DialogTitle>
                              <DialogDescription>Inserisci i dettagli della rata da registrare.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Importo (€)</div>
                                <Input
                                  value={dcaForm.amount}
                                  onChange={(e) => setDcaForm(f => ({ ...f, amount: e.target.value }))}
                                  type="number" step="0.01" min="0"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Prezzo unitario</div>
                                <Input
                                  value={dcaForm.price}
                                  onChange={(e) => setDcaForm(f => ({ ...f, price: e.target.value }))}
                                  type="number" step="0.00000001" min="0"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Data</div>
                                <Input
                                  value={dcaForm.date}
                                  onChange={(e) => setDcaForm(f => ({ ...f, date: e.target.value }))}
                                  type="date"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <div className="text-xs text-gray-500 mb-1">Nota (opzionale)</div>
                                <Input
                                  value={dcaForm.note}
                                  onChange={(e) => setDcaForm(f => ({ ...f, note: e.target.value }))}
                                  placeholder="Es. versamento mensile"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" onClick={() => setDcaOpenId(null)}>Annulla</Button>
                              <Button onClick={submitDca}>Registra</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    <Dialog open={deleteOpen && investmentToDelete?.id === investment.id} onOpenChange={(v) => {
                      if (!v) { setDeleteOpen(false); setInvestmentToDelete(null); }
                    }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setInvestmentToDelete({ id: investment.id, symbol: investment.symbol }); setDeleteOpen(true); }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 h-9 w-9 p-0"
                        aria-label="Elimina investimento"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Eliminare questo investimento?</DialogTitle>
                          <DialogDescription>
                            Questa azione non può essere annullata. Verrà eliminato l'investimento
                            {investmentToDelete?.symbol ? ` "${investmentToDelete.symbol}"` : ''}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" onClick={() => { setDeleteOpen(false); setInvestmentToDelete(null); }}>Annulla</Button>
                          <Button variant="destructive" onClick={confirmDelete}>Elimina</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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
