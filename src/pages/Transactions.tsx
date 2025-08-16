
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Layout from '@/components/Layout/Layout';
import TransactionForm from '@/components/Transactions/TransactionForm';
import EditTransactionForm from '@/components/Transactions/EditTransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CirclePlus, Search, Filter, Edit, Trash2, TrendingUp, TrendingDown, Calendar, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { Transaction } from '@/types';

const Transactions: React.FC = () => {
  const { transactions, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Aggiorna selectedTransaction quando le transazioni cambiano
  React.useEffect(() => {
    if (selectedTransaction) {
      const updatedTransaction = transactions.find(t => t.id === selectedTransaction.id);
      if (updatedTransaction) {
        setSelectedTransaction(updatedTransaction);
      }
    }
  }, [transactions, selectedTransaction?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      short: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
      full: date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Filtri e ordinamento
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    })
    .slice()
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default: // date
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const availableCategories = [...new Set(transactions.map(t => t.category))];

  // Statistiche rapide
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleDeleteTransaction = async (transaction: Transaction) => {
    setDeletingId(transaction.id);
    try {
      await deleteTransaction(transaction.id);
      toast.success(`"${transaction.description}" è stata eliminata.`);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Errore durante l\'eliminazione della transazione');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header migliorato */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestione Transazioni
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Monitora e organizza le tue entrate e uscite
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <CirclePlus className="w-4 h-4 mr-2" />
                Nuova Transazione
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <TransactionForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiche rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Entrate Filtrate
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Uscite Filtrate
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Euro className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bilancio
                  </p>
                  <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalIncome - totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtri migliorati */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtri e Ricerca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca transazioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {availableCategories.map(category => (
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
                  <SelectItem value="income">💰 Entrate</SelectItem>
                  <SelectItem value="expense">💸 Uscite</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">📅 Data</SelectItem>
                  <SelectItem value="amount">💰 Importo</SelectItem>
                  <SelectItem value="category">🏷️ Categoria</SelectItem>
                  <SelectItem value="description">📝 Descrizione</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('desc')}
              >
                ↓ Decrescente
              </Button>
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('asc')}
              >
                ↑ Crescente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista Transazioni */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transazioni ({filteredTransactions.length})</span>
              {filteredTransactions.length > 0 && (
                <Badge variant="secondary">
                  {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' ? 'Filtrate' : 'Tutte'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nessuna transazione trovata
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Inizia aggiungendo la tua prima transazione'
                  }
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <CirclePlus className="w-4 h-4 mr-2" />
                      Aggiungi Transazione
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <TransactionForm />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => {
                  const dateInfo = formatDate(transaction.date);
                  
                  return (
                    <div
                      key={transaction.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                            transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {transaction.description}
                              </h3>
                              <div className={`font-bold text-lg flex-shrink-0 ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mt-1 gap-2">
                              <Badge variant="outline" className="text-xs">
                                {transaction.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span title={dateInfo.full}>
                                  {dateInfo.short}
                                </span>
                              </div>
                              {transaction.note && (
                                <Badge variant="secondary" className="text-xs">
                                  📝 Nota
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-blue-100 hover:text-blue-600 p-2"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setEditOpen(true);
                            }}
                            disabled={deletingId === transaction.id}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-red-100 hover:text-red-600 p-2"
                                disabled={deletingId === transaction.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare la transazione "{transaction.description}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata. La transazione verrà rimossa definitivamente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTransaction(transaction)}
                                  disabled={deletingId === transaction.id}
                                >
                                  {deletingId === transaction.id ? 'Eliminazione…' : 'Elimina'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Dialog Modifica Transazione */}
        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            // Non resettiamo selectedTransaction quando il dialog si chiude
            // Lo resettiamo solo quando selezioniamo una nuova transazione
          }}
        >
          <DialogContent className="sm:max-w-md">
            {selectedTransaction && (
              <EditTransactionForm
                key={selectedTransaction.id}
                transaction={selectedTransaction}
                onSuccess={() => {
                  toast.success('Transazione aggiornata');
                  setEditOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Transactions;
