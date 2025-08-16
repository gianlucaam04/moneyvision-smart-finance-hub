import React from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types';
import { toast } from 'sonner';

interface EditTransactionFormProps {
  transaction: Transaction;
  onSuccess?: () => void;
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({ transaction, onSuccess }) => {
  const { updateTransaction, categories } = useFinance();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Inizializza il form con i dati della transazione se disponibile
  const getInitialFormData = () => {
    if (!transaction) {
      return {
        amount: '',
        description: '',
        category: '',
        type: 'expense' as 'income' | 'expense',
        date: new Date().toISOString().split('T')[0],
        note: ''
      };
    }
    
    return {
      amount: String(Math.abs(transaction.amount)),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date?.slice(0, 10) || new Date().toISOString().split('T')[0],
      note: transaction.note || ''
    };
  };
  
  const [formData, setFormData] = React.useState(getInitialFormData());

  React.useEffect(() => {
    if (!transaction) return;
    
    const newFormData = {
      amount: String(Math.abs(transaction.amount)),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date?.slice(0, 10) || new Date().toISOString().split('T')[0],
      note: transaction.note || ''
    };
    
    setFormData(newFormData);
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.category) {
      // Validation basic; toast in parent if needed
      return;
    }

    const parsed = parseFloat(formData.amount);
    const amount = formData.type === 'expense' ? -Math.abs(parsed) : Math.abs(parsed);

    setIsSubmitting(true);
    try {
      await updateTransaction(transaction.id, {
        amount,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: formData.date,
        note: formData.note || ''
      });

      toast.success('Transazione aggiornata');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast.error('Errore durante l\'aggiornamento della transazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === 'both'
  );

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Modifica Transazione
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
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvataggio…' : 'Salva Modifiche'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditTransactionForm;
