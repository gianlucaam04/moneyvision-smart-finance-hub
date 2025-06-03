
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
import { CirclePlus, Search, Filter, Edit, Trash2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-6">
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

            {/* Filters Section */}
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cerca transazioni..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
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
                      <SelectItem value="income">Entrate</SelectItem>
                      <SelectItem value="expense">Uscite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Transazioni ({filteredTransactions.length})</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Ultime modifiche
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
                        className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'income' ? 'bg-success' : 'bg-expense'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {transaction.description}
                              </h3>
                              <div className={`font-bold text-lg ${
                                transaction.type === 'income' ? 'text-success' : 'text-expense'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>{transaction.category}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(transaction.date)}</span>
                              {transaction.note && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="italic">📝 {transaction.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm" className="hover:bg-finance-blue/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
    </div>
  );
};

export default Transactions;
