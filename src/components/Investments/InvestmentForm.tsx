
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import SymbolSearch from './SymbolSearch';
import { investmentsService } from '@/services/investmentsService';
import type { FinnhubSearchResult, InvestmentFormData } from '@/types/investments';

interface InvestmentFormProps {
  onInvestmentAdded: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ onInvestmentAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<FinnhubSearchResult | null>(null);
  const [formData, setFormData] = useState<Partial<InvestmentFormData>>({
    quantity: 1,
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSymbolSelect = (symbol: FinnhubSearchResult) => {
    setSelectedSymbol(symbol);
    setFormData(prev => ({
      ...prev,
      symbol: symbol.displaySymbol,
      name: symbol.description
    }));
  };

  const handleInputChange = (field: keyof InvestmentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSymbol || !formData.quantity || !formData.purchase_price || !formData.purchase_date) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setIsSubmitting(true);
    try {
      await investmentsService.addInvestment({
        symbol: selectedSymbol.displaySymbol,
        name: selectedSymbol.description,
        quantity: Number(formData.quantity),
        purchase_price: Number(formData.purchase_price),
        purchase_date: formData.purchase_date
      });

      toast.success('Investimento aggiunto con successo!');
      setIsOpen(false);
      setSelectedSymbol(null);
      setFormData({
        quantity: 1,
        purchase_date: new Date().toISOString().split('T')[0]
      });
      onInvestmentAdded();
    } catch (error) {
      toast.error('Errore nell\'aggiunta dell\'investimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSymbol(null);
    setFormData({
      quantity: 1,
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Card className="bg-gradient-to-r from-finance-blue to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Aggiungi Investimento</h3>
                <p className="text-blue-100">Espandi il tuo portafoglio con nuovi asset</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsOpen(true)} 
              variant="secondary"
              className="bg-white text-finance-blue hover:bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-finance-blue/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-finance-blue" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Nuovo Investimento</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Aggiungi un nuovo asset al tuo portafoglio</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetForm} className="text-gray-500 hover:text-gray-700">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="symbol-search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cerca Asset *
            </Label>
            <SymbolSearch 
              onSymbolSelect={handleSymbolSelect}
              selectedSymbol={selectedSymbol || undefined}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantità *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                min="0"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="1.5"
                className="border-gray-200 dark:border-gray-600 focus:border-finance-blue focus:ring-finance-blue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Prezzo di Acquisto (€) *
              </Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price || ''}
                onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                placeholder="150.25"
                className="border-gray-200 dark:border-gray-600 focus:border-finance-blue focus:ring-finance-blue"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data di Acquisto *
            </Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date || ''}
              onChange={(e) => handleInputChange('purchase_date', e.target.value)}
              className="border-gray-200 dark:border-gray-600 focus:border-finance-blue focus:ring-finance-blue"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedSymbol}
              className="flex-1 bg-finance-blue hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? 'Aggiunta...' : 'Aggiungi Investimento'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annulla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvestmentForm;
