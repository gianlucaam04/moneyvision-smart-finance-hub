import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Category, Transaction } from '@/types';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CirclePlus, Edit, Trash2, Palette, Target, TrendingUp, Search, SlidersHorizontal, X, CircleDollarSign, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FilterBar from '@/components/Categories/FilterBar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// Interfacce tipizzate per la gestione delle categorie
interface CategoryWithStats extends Category {
  transactions: number;
  totalAmount: number;
}

interface CategoryDialogState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  selectedCategory?: CategoryWithStats;
}

interface BudgetDialogState {
  isOpen: boolean;
  category?: CategoryWithStats;
  budget: string;
}

interface TransactionViewState {
  isOpen: boolean;
  categoryName?: string;
  transactions: Transaction[];
}

interface ConfirmDialogState {
  isOpen: boolean;
  category?: CategoryWithStats;
}

// Hook per debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Categories: React.FC = () => {
  const { transactions, categories: contextCategories, addCategory, updateCategory, deleteCategory } = useFinance();
  const { toast } = useToast();

  // Stati per la gestione delle categorie
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [newCategoryIcon, setNewCategoryIcon] = useState('circle-dollar-sign');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  
  // Stati per i dialog
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialogState>({
    isOpen: false,
    mode: 'add'
  });
  
  const [budgetDialog, setBudgetDialog] = useState<BudgetDialogState>({
    isOpen: false,
    budget: ''
  });
  
  const [transactionView, setTransactionView] = useState<TransactionViewState>({
    isOpen: false,
    transactions: []
  });
  
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
  });
  
  // Stati per filtri e ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'transactions' | 'amount'>('name');
  
  const highlightCategoryName = (name: string) => {
    if (!debouncedSearchQuery) return name;
    const escaped = debouncedSearchQuery.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return name.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  const colorOptions = [
    '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  const iconOptions = [
    'circle-dollar-sign', 'credit-card', 'shopping-cart', 'home', 
    'car', 'utensils', 'plane', 'briefcase', 'heart', 'gift'
  ];

  // Calcoliamo statistiche per ogni categoria dal context
  const categoriesWithStats = useMemo(() => {
    return contextCategories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category.name);
      const transactionCount = categoryTransactions.length;
      const totalAmount = categoryTransactions.reduce((sum, t) => {
        // Per le spese, sommiamo il valore assoluto perché potrebbero essere negativi
        return category.type === 'expense' 
          ? sum + Math.abs(t.amount) 
          : sum + t.amount;
      }, 0);
      
      return {
        ...category,
        transactions: transactionCount,
        totalAmount
      } as CategoryWithStats;
    });
  }, [contextCategories, transactions]);

  // Funzioni filtrate per le categorie
  const filteredCategories = useMemo(() => {
    let result = categoriesWithStats;
    
    // Applicazione filtro di ricerca
    if (debouncedSearchQuery) {
      result = result.filter(cat => 
        cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }
    
    // Filtro per tipo
    if (typeFilter !== 'all') {
      result = result.filter(cat => cat.type === typeFilter);
    }
    
    // Ordinamento
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'transactions') {
        return b.transactions - a.transactions;
      } else { // amount
        return b.totalAmount - a.totalAmount;
      }
    });
    
    return result;
  }, [categoriesWithStats, debouncedSearchQuery, typeFilter, sortBy]);
  
  // Categorie filtrate per spese e entrate
  const expenseCategories = useMemo(() => 
    filteredCategories.filter(cat => cat.type === 'expense'),
    [filteredCategories]
  );
  
  const incomeCategories = useMemo(() => 
    filteredCategories.filter(cat => cat.type === 'income'),
    [filteredCategories]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Funzione per validare il nome della categoria
  const validateCategoryName = (name: string): { valid: boolean; message?: string } => {
    if (name.trim().length < 3) {
      return { valid: false, message: 'Il nome deve contenere almeno 3 caratteri' };
    }
    
    const isDuplicate = contextCategories.some(
      cat => cat.name.toLowerCase() === name.toLowerCase() && 
             (categoryDialog.mode === 'add' || categoryDialog.selectedCategory?.id !== cat.id)
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'Esiste già una categoria con questo nome' };
    }
    
    return { valid: true };
  };
  
  // Reset del form categoria
  const resetCategoryForm = () => {
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
    setNewCategoryIcon('circle-dollar-sign');
    setNewCategoryType('expense');
  };
  
  // Apertura dialog aggiunta categoria
  const openAddCategoryDialog = () => {
    resetCategoryForm();
    setCategoryDialog({ isOpen: true, mode: 'add' });
  };
  
  // Apertura dialog modifica categoria
  const openEditCategoryDialog = (category: CategoryWithStats) => {
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setNewCategoryIcon(category.icon);
    setNewCategoryType(category.type as 'expense' | 'income');
    setCategoryDialog({ 
      isOpen: true, 
      mode: 'edit',
      selectedCategory: category
    });
  };
  
  // Gestione aggiunta categoria
  const handleAddCategory = () => {
    // Validazione
    const validation = validateCategoryName(newCategoryName);
    if (!validation.valid) {
      toast({
        title: "⚠️ Errore Validazione",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    // Aggiungi categoria al context
    addCategory({
      name: newCategoryName,
      color: newCategoryColor,
      icon: newCategoryIcon,
      type: newCategoryType
    });
    
    toast({
      title: "✅ Categoria Creata",
      description: `"${newCategoryName}" è stata aggiunta con successo.`,
    });
    
    resetCategoryForm();
    setCategoryDialog({ isOpen: false, mode: 'add' });
  };
  
  // Gestione modifica categoria
  const handleUpdateCategory = () => {
    const validation = validateCategoryName(newCategoryName);
    if (!validation.valid) {
      toast({
        title: "⚠️ Errore Validazione",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    if (categoryDialog.selectedCategory) {
      updateCategory(categoryDialog.selectedCategory.id, {
        name: newCategoryName,
        color: newCategoryColor,
        icon: newCategoryIcon,
        type: newCategoryType
      });
      toast({
        title: "✅ Categoria Aggiornata",
        description: `"${newCategoryName}" modificata con successo.`
      });
    }
    resetCategoryForm();
    setCategoryDialog({ isOpen: false, mode: 'add' });
  };
  
  // Gestione eliminazione categoria
  const handleDeleteCategory = (category: CategoryWithStats) => {
    setConfirmDialog({ isOpen: true, category });
  };
  
  // Conferma eliminazione
  const handleConfirmDelete = () => {
    if (confirmDialog.category) {
      deleteCategory(confirmDialog.category.id);
      toast({
        title: "✅ Categoria Rimossa",
        description: `"${confirmDialog.category.name}" è stata eliminata.`
      });
    }
    setConfirmDialog({ isOpen: false });
  };
  
  // Apertura dialog budget
  const openBudgetDialog = (category: CategoryWithStats) => {
    setBudgetDialog({
      isOpen: true,
      category,
      budget: category.budget ? category.budget.toString() : ''
    });
  };
  
  // Gestione impostazione budget
  const handleSetBudget = () => {
    if (!budgetDialog.category) return;
    const budgetValue = parseFloat(budgetDialog.budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast({
        title: "⚠️ Valore non valido",
        description: "Inserisci un importo valido maggiore di zero.",
        variant: "destructive"
      });
      return;
    }
    updateCategory(budgetDialog.category.id, { budget: budgetValue });
    toast({
      title: "✅ Budget Aggiornato",
      description: `Budget impostato a ${formatCurrency(budgetValue)} per "${budgetDialog.category.name}"`
    });
    setBudgetDialog({ isOpen: false, budget: '' });
  };
  
  // Visualizzazione transazioni per categoria
  const viewCategoryTransactions = (categoryName: string) => {
    const categoryTransactions = transactions
      .filter(t => t.category === categoryName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactionView({
      isOpen: true,
      categoryName,
      transactions: categoryTransactions
    });
  };

  // Renderizzazione della pagina
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header e Filtri */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                Gestione Categorie
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
                Organizza e monitora le tue categorie di spesa e entrata
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg lg:text-xl">
              <Palette className="w-5 h-5 mr-2" />
              Statistiche Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-blue-600">
                  {filteredCategories.length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                  Categorie Totali
                </div>
              </div>
              
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-red-600">
                  {expenseCategories.length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                  Categorie Spesa
                </div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  {incomeCategories.length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                  Categorie Entrata
                </div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-xl lg:text-2xl font-bold text-yellow-600">
                  {filteredCategories.filter(cat => cat.budget).length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                  Con Budget
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full sm:w-auto bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white"
          onClick={openAddCategoryDialog}
        >
          <CirclePlus className="w-4 h-4 mr-2" />
          Nuova Categoria
        </Button>

        {/* Filtri e Ricerca */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Categories Overview */}
        <div className="w-full overflow-hidden">
          {(typeFilter === 'all' || typeFilter === 'expense') && (
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg lg:text-xl">
                <span className="text-xl mr-2">💸</span>
                Categorie di Spesa ({expenseCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenseCategories.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nessuna categoria di spesa trovata</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      className="mt-2" 
                      onClick={() => setSearchQuery('')}
                    >
                      Cancella ricerca
                    </Button>
                  )}
                </div>
              )}
              
              {expenseCategories.map((category) => (
                <div key={category.id} className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = (LucideIcons as any)[category.icon];
                            return IconComponent ? <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : null;
                          })()}
                          <h3 className="font-semibold text-gray-900 dark:text-white">{highlightCategoryName(category.name)}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditCategoryDialog(category)}
                            className="p-1 h-auto"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="p-1 h-auto hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 w-full">
                        <div 
                          className="text-sm text-gray-600 dark:text-gray-300 whitespace-normal break-words cursor-pointer hover:underline"
                          onClick={() => viewCategoryTransactions(category.name)}
                        >
                          {category.transactions} transazioni • {formatCurrency(category.totalAmount)}
                        </div>
                        {category.budget && (
                          <div className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                            category.totalAmount > category.budget 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            Budget: {formatCurrency(category.budget)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openBudgetDialog(category)}
                          className="text-xs h-7"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          {category.budget ? 'Modifica Budget' : 'Imposta Budget'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          )}
          {(typeFilter === 'all' || typeFilter === 'income') && (
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg lg:text-xl">
                <span className="text-xl mr-2">💰</span>
                Categorie di Entrata ({incomeCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incomeCategories.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nessuna categoria di entrata trovata</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      className="mt-2" 
                      onClick={() => setSearchQuery('')}
                    >
                      Cancella ricerca
                    </Button>
                  )}
                </div>
              )}
              
              {incomeCategories.map((category) => (
                <div key={category.id} className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = (LucideIcons as any)[category.icon];
                            return IconComponent ? <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : null;
                          })()}
                          <h3 className="font-semibold text-gray-900 dark:text-white">{highlightCategoryName(category.name)}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditCategoryDialog(category)}
                            className="p-1 h-auto"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="p-1 h-auto hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div 
                        className="text-sm text-gray-600 dark:text-gray-300 whitespace-normal break-words mt-2 cursor-pointer hover:underline"
                        onClick={() => viewCategoryTransactions(category.name)}
                      >
                        {category.transactions} transazioni • {formatCurrency(category.totalAmount)}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>Fonte di entrata attiva</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <Navigation className="flex flex-row justify-around items-center space-y-0" />
      </nav>

      {/* Dialog Aggiungi/Modifica Categoria */}
      <Dialog open={categoryDialog.isOpen} onOpenChange={(open) => !open && setCategoryDialog({...categoryDialog, isOpen: false})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryDialog.mode === 'add' ? 'Aggiungi Categoria' : 'Modifica Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome Categoria</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Es. Alimentari, Trasporti, Stipendio..."
              />
              {!validateCategoryName(newCategoryName).valid && (
                <p className="text-sm text-red-600 mt-1">{validateCategoryName(newCategoryName).message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={newCategoryType}
                onValueChange={(value: 'expense' | 'income') => setNewCategoryType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Spesa</SelectItem>
                  <SelectItem value="income">Entrata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Colore</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color}
                    className={`w-6 h-6 rounded-full cursor-pointer ${newCategoryColor === color ? 'ring-2 ring-offset-2 ring-finance-blue' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Icona</Label>
              <Select 
                value={newCategoryIcon}
                onValueChange={(value: string) => setNewCategoryIcon(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCategoryDialog({...categoryDialog, isOpen: false})}
            >
              Annulla
            </Button>
            <Button 
              disabled={!validateCategoryName(newCategoryName).valid}
              onClick={categoryDialog.mode === 'add' ? handleAddCategory : handleUpdateCategory}
            >
              {categoryDialog.mode === 'add' ? 'Aggiungi' : 'Aggiorna'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Budget */}
      <Dialog open={budgetDialog.isOpen} onOpenChange={(open) => !open && setBudgetDialog({...budgetDialog, isOpen: false})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Imposta Budget {budgetDialog.category && `per "${budgetDialog.category.name}"`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="budget">Importo Budget</Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="budget"
                  className="pl-10"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetDialog.budget}
                  onChange={(e) => setBudgetDialog({...budgetDialog, budget: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Il budget ti aiuta a monitorare e limitare le spese per questa categoria.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBudgetDialog({...budgetDialog, isOpen: false})}
            >
              Annulla
            </Button>
            <Button onClick={handleSetBudget}>
              Conferma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Visualizza Transazioni */}
      <Dialog open={transactionView.isOpen} onOpenChange={(open) => !open && setTransactionView({...transactionView, isOpen: false})}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-between">
            <DialogHeader>
              <DialogTitle>
                Transazioni: {transactionView.categoryName}
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-8 w-8 p-0"
              onClick={() => setTransactionView({...transactionView, isOpen: false})}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {transactionView.transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Nessuna transazione trovata per questa categoria.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactionView.transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium whitespace-normal break-words">{transaction.description}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Conferma Eliminazione */}
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog({ isOpen: open, category: confirmDialog.category })}
        title="Conferma Eliminazione"
        description={`Sei sicuro di voler eliminare la categoria "${confirmDialog.category?.name}"?`}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
};

export default Categories;
