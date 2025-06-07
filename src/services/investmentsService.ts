
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

  // Aggiorna prezzi correnti
  async updateCurrentPrices(investments: Investment[]): Promise<Investment[]> {
    const symbols = investments.map(inv => inv.symbol);
    const quotes = await finnhubApi.getMultipleQuotes(symbols);

    const updatedInvestments: Investment[] = [];

    for (const investment of investments) {
      const quote = quotes[investment.symbol];
      
      if (quote && quote.c) {
        const { data, error } = await supabase
          .from('investments')
          .update({
            current_price: quote.c,
            change_percent: quote.dp
          })
          .eq('id', investment.id)
          .select()
          .single();

        if (error) {
          console.error(`Errore aggiornamento prezzo per ${investment.symbol}:`, error);
          updatedInvestments.push(investment);
        } else {
          updatedInvestments.push(data);
        }
      } else {
        updatedInvestments.push(investment);
      }
    }

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
  }
};
