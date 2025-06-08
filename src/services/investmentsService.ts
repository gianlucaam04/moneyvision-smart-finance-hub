import { supabase } from '@/integrations/supabase/client';
import type { Investment, InvestmentFormData } from '@/types/investments';
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

    const { data, error } = await supabase
      .from('investments')
      .insert({
        ...investmentData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiunta investimento:', error);
      throw new Error('Impossibile aggiungere l\'investimento');
    }

    return data;
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
  async updateInvestment(id: string, data: Partial<InvestmentFormData>): Promise<Investment> {
    const { data: updated, error } = await supabase
      .from('investments')
      .update(data)
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
