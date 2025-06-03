
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import TransactionForm from '@/components/Transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CirclePlus, Search, Filter, Edit, Trash2, Brain, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Transactions: React.FC = () => {
  const { transactions } = useFinance();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [transactionNote, setTransactionNote] = useState('');
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);

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

  // AI Smart Insights per le transazioni
  const aiTransactionInsights = [
    {
      id: 1,
      type: 'anomaly',
      icon: '🚨',
      title: 'Spesa Anomala Rilevata',
      message: 'Hai speso €350 per "Intrattenimento" ieri, il 200% in più della tua media.',
      actions: ['Verifica', 'Ignora']
    },
    {
      id: 2,
      type: 'duplicate',
      icon: '👥',
      title: 'Possibile Duplicato',
      message: 'Transazione simile trovata: "Supermercato" per €85.50 dello stesso giorno.',
      actions: ['Controlla', 'Ignora']
    },
    {
      id: 3,
      type: 'category',
      icon: '🏷️',
      title: 'Categorizzazione Suggerita',
      message: '3 transazioni potrebbero essere categorizzate meglio per un tracking preciso.',
      actions: ['Ottimizza', 'Dopo']
    }
  ];

  const visibleInsights = aiTransactionInsights.filter(insight => !dismissedInsights.includes(insight.id));

  const dismissInsight = (id: number) => {
    setDismissedInsights(prev => [...prev, id]);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
            {/* Header Section - Mobile Optimized */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Gestione Transazioni
                </h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
                  Monitora e organizza le tue entrate e uscite
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <CirclePlus className="w-4 h-4 mr-2" />
                    Nuova Transazione
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-[95vw] sm:max-w-md">
                  <TransactionForm />
                </DialogContent>
              </Dialog>
            </div>

            {/* AI Smart Insights - Notifiche Card Discrete */}
            {visibleInsights.length > 0 && (
              <div className="space-y-2">
                {visibleInsights.map((insight) => (
                  <Card key={insight.id} className={`border-l-4 ${
                    insight.type === 'anomaly' ? 'border-l-red-400 bg-red-50 dark:bg-red-900/10' :
                    insight.type === 'duplicate' ? 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' :
                    'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10'
                  } animate-fade-in`}>
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">{insight.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">
                                {insight.title}
                              </h4>
                              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {insight.message}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissInsight(insight.id)}
                              className="p-1 h-auto flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {insight.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant={idx === 0 ? "default" : "outline"}
                                className="text-xs px-3 py-1 h-auto"
                                onClick={() => toast({
                                  title: `🔍 ${action}`,
                                  description: "Funzione in fase di sviluppo."
                                })}
                              >
                                {action}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Filters Section - Mobile Optimized */}
            <Card className="animate-fade-in">
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

            {/* Transactions List - Mobile Optimized */}
            <Card className="animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg lg:text-xl">
                  <span>Transazioni ({filteredTransactions.length})</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 hidden sm:block">
                    Recenti
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 lg:py-12 text-gray-500 dark:text-gray-400 px-4">
                    <span className="text-4xl lg:text-6xl mb-4 block">💳</span>
                    <p className="text-base lg:text-lg">Nessuna transazione trovata</p>
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
                            
                            <div className="flex flex-wrap items-center text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1 gap-1">
                              <span>{transaction.category}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{formatDate(transaction.date)}</span>
                              {transaction.note && (
                                <>
                                  <span className="hidden sm:inline">•</span>
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
                                  <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] sm:max-w-md">
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
                              <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
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
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <Navigation className="flex flex-row justify-around items-center space-y-0" />
      </nav>
    </div>
  );
};

export default Transactions;
