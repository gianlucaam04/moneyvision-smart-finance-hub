
import type { FinnhubSearchResult, FinnhubQuote } from '@/types/investments';

const API_KEY = 'd0hgbkhr01qv1u37bk10d0hgbkhr01qv1u37bk1g';
const BASE_URL = 'https://finnhub.io/api/v1';

export const finnhubApi = {
  // Cerca simboli/asset
  async searchSymbols(query: string): Promise<FinnhubSearchResult[]> {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Errore nella ricerca simboli');
      }
      
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Errore ricerca simboli:', error);
      throw error;
    }
  },

  // Ottieni quotazione corrente
  async getQuote(symbol: string): Promise<FinnhubQuote> {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Errore nel recupero quotazione');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore quotazione:', error);
      throw error;
    }
  },

  // Ottieni quotazioni multiple
  async getMultipleQuotes(symbols: string[]): Promise<Record<string, FinnhubQuote>> {
    const quotes: Record<string, FinnhubQuote> = {};
    
    // Esegui le chiamate in parallelo ma con rate limiting
    const promises = symbols.map(async (symbol, index) => {
      // Aggiungi un piccolo delay per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, index * 100));
      
      try {
        const quote = await this.getQuote(symbol);
        quotes[symbol] = quote;
      } catch (error) {
        console.error(`Errore quotazione per ${symbol}:`, error);
      }
    });
    
    await Promise.all(promises);
    return quotes;
  }
};
