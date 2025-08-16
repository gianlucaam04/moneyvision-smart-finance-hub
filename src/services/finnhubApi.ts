
import type { FinnhubSearchResult, FinnhubQuote } from '@/types/investments';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined;
const BASE_URL = 'https://finnhub.io/api/v1';

// Rate limiting: massimo 60 chiamate al minuto per il piano gratuito
let lastCallTime = 0;
const MIN_INTERVAL = 1000; // 1 secondo tra le chiamate

const rateLimitedFetch = async (url: string) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall));
  }
  
  lastCallTime = Date.now();
  return fetch(url);
};

export const finnhubApi = {
  // Cerca simboli/asset
  async searchSymbols(query: string): Promise<FinnhubSearchResult[]> {
    if (!query.trim()) return [];
    if (!API_KEY) {
      console.warn('VITE_FINNHUB_API_KEY mancante: impossibile cercare simboli su Finnhub');
      return [];
    }
    
    try {
      const response = await rateLimitedFetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`
      );
      
      if (response.status === 403) {
        console.warn('API Finnhub: limite rate raggiunto o chiave non valida');
        return [];
      }
      
      if (!response.ok) {
        console.warn(`API Finnhub: errore ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.warn('Errore ricerca simboli Finnhub:', error);
      return [];
    }
  },

  // Ottieni quotazione corrente
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    if (!API_KEY) {
      console.warn('VITE_FINNHUB_API_KEY mancante: impossibile ottenere quote Finnhub');
      return null;
    }
    try {
      const response = await rateLimitedFetch(
        `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`
      );
      
      if (response.status === 403) {
        console.warn(`API Finnhub: limite rate raggiunto per ${symbol}`);
        return null;
      }
      
      if (!response.ok) {
        console.warn(`API Finnhub: errore ${response.status} per ${symbol}`);
        return null;
      }
      
      const data = await response.json();
      
      // Verifica che i dati siano validi
      if (!data || typeof data.c !== 'number' || data.c <= 0) {
        console.warn(`Dati non validi ricevuti per ${symbol}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn(`Errore quotazione per ${symbol}:`, error);
      return null;
    }
  },

  // Ottieni quotazioni multiple con gestione errori migliorata
  async getMultipleQuotes(symbols: string[]): Promise<Record<string, FinnhubQuote>> {
    const quotes: Record<string, FinnhubQuote> = {};
    
    if (symbols.length === 0) return quotes;
    if (!API_KEY) {
      console.warn('VITE_FINNHUB_API_KEY mancante: impossibile aggiornare quotazioni multiple');
      return quotes;
    }
    
    console.log(`Aggiornamento prezzi per ${symbols.length} asset...`);
    
    // Esegui le chiamate in serie per evitare rate limiting
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      
      try {
        const quote = await this.getQuote(symbol);
        
        if (quote) {
          quotes[symbol] = quote;
          console.log(`✓ Prezzo aggiornato per ${symbol}: €${quote.c}`);
        } else {
          console.warn(`✗ Impossibile aggiornare prezzo per ${symbol}`);
        }
        
        // Pausa tra le chiamate per rispettare il rate limiting
        if (i < symbols.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1100));
        }
      } catch (error) {
        console.warn(`Errore per ${symbol}:`, error);
      }
    }
    
    return quotes;
  },

  // Verifica se l'API è disponibile
  async checkApiStatus(): Promise<boolean> {
    try {
      if (!API_KEY) return false;
      const response = await rateLimitedFetch(`${BASE_URL}/search?q=AAPL&token=${API_KEY}`);
      return response.ok && response.status !== 403;
    } catch {
      return false;
    }
  }
};
