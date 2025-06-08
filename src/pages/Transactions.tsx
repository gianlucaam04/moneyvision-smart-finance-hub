
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Layout from '@/components/Layout/Layout';
import TransactionForm from '@/components/Transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CirclePlus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Transactions: React.FC = () => {
  const { transactions } = useFinance();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [transactionNote, setTransactionNote] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(transactions.map(t => t.category))];

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionNote(transaction.note || '');
    toast({
      title: "✏️ Modifica Transazione",
      description: `Stai modificando: ${transaction.description}`,
    });
  };

  const handleDeleteTransaction = (transaction: any) => {
    const confirm = window.confirm(`Sei sicuro di voler eliminare "${transaction.description}"?`);
    if (confirm) {
      toast({
        title: "🗑️ Transazione Eliminata",
        description: `"${transaction.description}" è stata rimossa.`,
      });
    }
  };

  const handleAddNote = (transactionId: string) => {
    if (transactionNote.trim()) {
      toast({
        title: "📝 Nota Aggiunta",
        description: "La nota è stata salvata con successo.",
      });
      setTransactionNote('');
      setEditingTransaction(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestione Transazioni
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Monitora e organizza le tue entrate e uscite
          </p>
        </div>

        {/* Add Transaction Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <CirclePlus className="w-4 h-4 mr-2" />
              Nuova Transazione
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TransactionForm />
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca transazioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le categorie</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="income">Entrate 📈</SelectItem>
                    <SelectItem value="expense">Uscite 📉</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Transazioni ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 px-4">
                <span className="text-6xl mb-4 block">💳</span>
                <p className="text-lg">Nessuna transazione trovata</p>
                <p className="text-sm mt-2">
                  {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Inizia aggiungendo la tua prima transazione'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        transaction.type === 'income' ? 'bg-success' : 'bg-expense'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {transaction.description}
                          </h3>
                          <div className={`font-bold text-base flex-shrink-0 ${
                            transaction.type === 'income' ? 'text-success' : 'text-expense'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mt-1 gap-1">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.note && (
                            <>
                              <span>•</span>
                              <span className="italic text-blue-600">📝 Nota presente</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-finance-blue/10 p-2"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Modifica Transazione</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Descrizione</label>
                                  <Input value={transaction.description} readOnly className="bg-gray-50" />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Importo</label>
                                  <Input value={formatCurrency(transaction.amount)} readOnly className="bg-gray-50" />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Aggiungi Nota</label>
                                  <Textarea
                                    placeholder="Aggiungi una nota a questa transazione..."
                                    value={transactionNote}
                                    onChange={(e) => setTransactionNote(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleAddNote(transaction.id)} className="flex-1">
                                  Salva Nota
                                </Button>
                                <Button variant="outline" onClick={() => setEditingTransaction(null)}>
                                  Annulla
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-red-50 hover:text-red-600 p-2"
                          onClick={() => handleDeleteTransaction(transaction)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;
