
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { finnhubApi } from '@/services/finnhubApi';
import type { FinnhubSearchResult } from '@/types/investments';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: FinnhubSearchResult) => void;
  selectedSymbol?: FinnhubSearchResult;
}

const SymbolSearch: React.FC<SymbolSearchProps> = ({ onSymbolSelect, selectedSymbol }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FinnhubSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Chiudi i risultati quando si clicca fuori
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      setQuery(`${selectedSymbol.displaySymbol} - ${selectedSymbol.description}`);
      setShowResults(false);
    }
  }, [selectedSymbol]);

  const searchSymbols = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await finnhubApi.searchSymbols(searchQuery);
      setResults(searchResults.slice(0, 10)); // Limita a 10 risultati
      setShowResults(true);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      searchSymbols(value);
    }, 300);
  };

  const handleSymbolSelect = (symbol: FinnhubSearchResult) => {
    onSymbolSelect(symbol);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Cerca simbolo o nome asset (es. AAPL, Tesla...)"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" size={20} />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <Button
              key={`${result.symbol}-${index}`}
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => handleSymbolSelect(result)}
            >
              <div className="flex flex-col">
                <div className="font-medium text-sm">{result.displaySymbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {result.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Nessun risultato trovato per "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;
