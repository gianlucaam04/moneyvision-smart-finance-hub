
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface TransactionFormProps {
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { addTransaction, categories } = useFinance();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    const amount = formData.type === 'expense' 
      ? -Math.abs(parseFloat(formData.amount))
      : Math.abs(parseFloat(formData.amount));

    addTransaction({
      amount,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      date: formData.date,
      note: formData.note || undefined
    });

    toast({
      title: "Transazione aggiunta",
      description: `${formData.type === 'income' ? 'Entrata' : 'Spesa'} di €${Math.abs(amount).toFixed(2)} aggiunta con successo`,
    });

    // Reset form
    setFormData({
      amount: '',
      description: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const availableCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === 'both'
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Nuova Transazione
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo Transazione */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={formData.type === 'expense' ? 'default' : 'outline'}
              className={`${formData.type === 'expense' ? 'bg-expense hover:bg-expense/90' : ''}`}
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
            >
              💸 Spesa
            </Button>
            <Button
              type="button"
              variant={formData.type === 'income' ? 'default' : 'outline'}
              className={`${formData.type === 'income' ? 'bg-success hover:bg-success/90' : ''}`}
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
            >
              💰 Entrata
            </Button>
          </div>

          {/* Importo */}
          <div className="space-y-2">
            <Label htmlFor="amount">Importo *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="text-right"
              required
            />
          </div>

          {/* Descrizione */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrivi la transazione"
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Nota */}
          <div className="space-y-2">
            <Label htmlFor="note">Aggiungi nota</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Note aggiuntive (opzionale)"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white font-medium transition-all duration-200"
          >
            Aggiungi Transazione
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
