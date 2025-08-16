import { supabase } from '@/integrations/supabase/client';
import type { Investment, InvestmentFormData, DcaHistoryEntry } from '@/types/investments';
import { finnhubApi } from './finnhubApi';

export const investmentsService = {
  // Ottieni tutti gli investimenti dell'utente
  async getUserInvestments(): Promise<Investment[]> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nel recupero investimenti:', error);
      throw new Error('Impossibile recuperare gli investimenti');
    }

    return data || [];
  },

  // Aggiungi nuovo investimento
  async addInvestment(investmentData: InvestmentFormData): Promise<Investment> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    const payload: Partial<Investment> = {
      symbol: investmentData.symbol,
      name: investmentData.name,
      isin: investmentData.isin ?? null,
      quantity: investmentData.quantity,
      purchase_price: investmentData.purchase_price,
      purchase_date: investmentData.purchase_date,
      // campi PAC
      dca_enabled: investmentData.dca_enabled ?? null,
      dca_amount: investmentData.dca_amount ?? null,
      dca_start_date: investmentData.dca_start_date ?? null,
      dca_day_of_month: investmentData.dca_day_of_month ?? null,
      dca_history: []
    };

    const { data, error } = await supabase
      .from('investments')
      // Cast a any per consentire colonne opzionali aggiuntive lato TS
      .insert({ ...(payload as any), user_id: user.id } as any)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiunta investimento:', error);
      throw new Error('Impossibile aggiungere l\'investimento');
    }

    return data;
  },

  // Registra una rata PAC (contributo) aggiornando quantità e prezzo medio
  async addDcaContribution(
    investmentId: string,
    params: { amount: number; price: number; date: string; note?: string }
  ): Promise<Investment> {
    const { data: inv, error: fetchErr } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .single();
    if (fetchErr || !inv) {
      console.error('Impossibile trovare investimento', fetchErr);
      throw new Error('Investimento non trovato');
    }

    const current: Investment = inv as unknown as Investment;

    const oldQty = current.quantity || 0;
    const oldAvg = current.purchase_price || 0;
    const addQty = params.price > 0 ? params.amount / params.price : 0;
    const newQty = oldQty + addQty;
    const newAvg = newQty > 0 ? ((oldQty * oldAvg) + params.amount) / newQty : oldAvg;

    const history: DcaHistoryEntry[] = Array.isArray(current.dca_history) ? (current.dca_history as DcaHistoryEntry[]) : [];
    const entry: DcaHistoryEntry = {
      date: params.date,
      amount: params.amount,
      price: params.price,
      quantity: addQty,
      note: params.note,
    };
    const updatedHistory = [...history, entry];

    const { data: updated, error } = await supabase
      .from('investments')
      .update({
        quantity: newQty,
        purchase_price: newAvg,
        dca_history: updatedHistory,
      })
      .eq('id', investmentId)
      .select()
      .single();

    if (error || !updated) {
      console.error('Errore nell\'aggiornare il contributo PAC:', error);
      throw new Error('Impossibile registrare la rata PAC');
    }

    return updated as unknown as Investment;
  },

  // Aggiorna prezzi correnti con gestione errori migliorata
  async updateCurrentPrices(investments: Investment[]): Promise<Investment[]> {
    if (investments.length === 0) {
      return investments;
    }

    // Verifica prima se l'API è disponibile
    const isApiAvailable = await finnhubApi.checkApiStatus();
    if (!isApiAvailable) {
      console.warn('API Finnhub non disponibile - aggiornamento prezzi saltato');
      throw new Error('Servizio prezzi temporaneamente non disponibile. Riprova più tardi.');
    }

    const symbols = investments.map(inv => inv.symbol);
    const quotes = await finnhubApi.getMultipleQuotes(symbols);

    const updatedInvestments: Investment[] = [];
    let successfulUpdates = 0;

    for (const investment of investments) {
      const quote = quotes[investment.symbol];
      
      if (quote && quote.c) {
        try {
          const { data, error } = await supabase
            .from('investments')
            .update({
              current_price: quote.c,
              change_percent: quote.dp || null
            })
            .eq('id', investment.id)
            .select()
            .single();

          if (error) {
            console.error(`Errore aggiornamento DB per ${investment.symbol}:`, error);
            updatedInvestments.push(investment);
          } else {
            updatedInvestments.push(data);
            successfulUpdates++;
          }
        } catch (error) {
          console.error(`Errore database per ${investment.symbol}:`, error);
          updatedInvestments.push(investment);
        }
      } else {
        // Mantieni i dati esistenti se non riusciamo ad aggiornare
        console.warn(`Mantengo prezzo esistente per ${investment.symbol}`);
        updatedInvestments.push(investment);
      }
    }

    if (successfulUpdates === 0) {
      throw new Error('Nessun prezzo è stato aggiornato. Verifica la connessione internet.');
    }

    console.log(`✓ ${successfulUpdates}/${investments.length} prezzi aggiornati con successo`);
    return updatedInvestments;
  },

  // Elimina investimento
  async deleteInvestment(id: string): Promise<void> {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Errore nell\'eliminazione investimento:', error);
      throw new Error('Impossibile eliminare l\'investimento');
    }
  },

  // Aggiorna investimento
  async updateInvestment(id: string, data: Partial<Investment>): Promise<Investment> {
    const { data: updated, error } = await supabase
      .from('investments')
      // consentiamo anche campi opzionali PAC/ISIN
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento investimento:', error);
      throw new Error('Impossibile aggiornare l\'investimento');
    }

    return updated;
  }
};
