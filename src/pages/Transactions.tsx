
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
import { CirclePlus, Search, Filter, Edit, Trash2, Brain, TrendingDown, AlertCircle } from 'lucide-react';

const Transactions: React.FC = () => {
  const { transactions } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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

  // AI Smart Suggestions per le transazioni
  const aiTransactionSuggestions = [
    {
      type: 'anomaly',
      icon: '🚨',
      title: 'Spesa Anomala Rilevata',
      message: 'Hai speso €350 per "Intrattenimento" ieri, il 200% in più della tua media.',
      action: 'Verifica',
      priority: 'high'
    },
    {
      type: 'duplicate',
      icon: '👥',
      title: 'Possibile Duplicato',
      message: 'Transazione simile trovata: "Supermercato Conad" per €85.50 dello stesso giorno.',
      action: 'Controlla',
      priority: 'medium'
    },
    {
      type: 'category',
      icon: '🏷️',
      title: 'Categorizzazione Suggerita',
      message: '3 transazioni potrebbero essere categorizzate meglio per un tracking più preciso.',
      action: 'Ottimizza',
      priority: 'low'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Gestione Transazioni
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Monitora e organizza le tue entrate e uscite
                </p>
              </div>
              
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
            </div>

            {/* AI Smart Suggestions */}
            <Card className="animate-fade-in border-l-4 border-l-orange-400">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-orange-500" />
                  AI Transaction Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiTransactionSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 md:p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                        suggestion.priority === 'high' 
                          ? 'bg-red-50 border-l-red-400 dark:bg-red-900/20' 
                          : suggestion.priority === 'medium'
                          ? 'bg-yellow-50 border-l-yellow-400 dark:bg-yellow-900/20'
                          : 'bg-blue-50 border-l-blue-400 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              {suggestion.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {suggestion.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="hover:bg-orange-500 hover:text-white text-xs">
                            {suggestion.action}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Ignora
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters Section */}
            <Card className="animate-fade-in">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cerca transazioni..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-48">
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
                      <SelectTrigger className="w-full sm:w-32">
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
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Transazioni ({filteredTransactions.length})</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 hidden sm:block">
                    Ultime modifiche
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
                        className="flex items-center justify-between p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            transaction.type === 'income' ? 'bg-success' : 'bg-expense'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {transaction.description}
                              </h3>
                              <div className={`font-bold text-base lg:text-lg flex-shrink-0 ${
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
                                  <span className="italic">📝 {transaction.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 lg:space-x-2 ml-2 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="hover:bg-finance-blue/10 p-2">
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600 p-2">
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
    </div>
  );
};

export default Transactions;
