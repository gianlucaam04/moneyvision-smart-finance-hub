
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
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
      <Button onClick={() => setIsOpen(true)} className="mb-6">
        <Plus className="w-4 h-4 mr-2" />
        Aggiungi Investimento
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nuovo Investimento</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetForm}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symbol-search">Cerca Asset *</Label>
            <SymbolSearch 
              onSymbolSelect={handleSymbolSelect}
              selectedSymbol={selectedSymbol || undefined}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantità *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                min="0"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="purchase_price">Prezzo di Acquisto (€) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price || ''}
                onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                placeholder="150.25"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purchase_date">Data di Acquisto *</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date || ''}
              onChange={(e) => handleInputChange('purchase_date', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedSymbol}
              className="flex-1"
            >
              {isSubmitting ? 'Aggiunta...' : 'Aggiungi Investimento'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Annulla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvestmentForm;
