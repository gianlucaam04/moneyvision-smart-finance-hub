
import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CirclePlus, Edit, Trash2, Palette, DollarSign } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Alimentari', color: '#10B981', icon: '🛒', budget: 500, type: 'expense' },
    { id: '2', name: 'Trasporti', color: '#3B82F6', icon: '🚗', budget: 300, type: 'expense' },
    { id: '3', name: 'Stipendio', color: '#059669', icon: '💼', budget: null, type: 'income' },
    { id: '4', name: 'Intrattenimento', color: '#8B5CF6', icon: '🎬', budget: 200, type: 'expense' },
    { id: '5', name: 'Bollette', color: '#EF4444', icon: '⚡', budget: 400, type: 'expense' },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#10B981',
    icon: '📝',
    budget: '',
    type: 'expense'
  });

  const predefinedColors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
    '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
  ];

  const predefinedIcons = [
    '🛒', '🚗', '💼', '🎬', '⚡', '🏥', '🎓', '🏋️', '🍕', '✈️',
    '🏠', '📱', '👕', '💄', '🎵', '📚', '🐕', '🌱', '🔧', '🎁'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleCreateCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: Date.now().toString(),
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon,
        budget: newCategory.budget ? Number(newCategory.budget) : null,
        type: newCategory.type
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', color: '#10B981', icon: '📝', budget: '', type: 'expense' });
      setIsCreateDialogOpen(false);
    }
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

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
                  Gestione Categorie
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Organizza e personalizza le tue categorie di spesa
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <CirclePlus className="w-4 h-4 mr-2" />
                    Nuova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Crea Nuova Categoria</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Nome Categoria</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        placeholder="Es. Alimentari"
                      />
                    </div>
                    
                    <div>
                      <Label>Tipo</Label>
                      <Select value={newCategory.type} onValueChange={(value) => setNewCategory({...newCategory, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Uscita</SelectItem>
                          <SelectItem value="income">Entrata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Icona</Label>
                      <div className="grid grid-cols-10 gap-2 mt-2">
                        {predefinedIcons.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setNewCategory({...newCategory, icon})}
                            className={`p-2 text-lg border rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              newCategory.icon === icon ? 'border-finance-blue bg-finance-blue/10' : 'border-gray-300'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Colore</Label>
                      <div className="grid grid-cols-10 gap-2 mt-2">
                        {predefinedColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewCategory({...newCategory, color})}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newCategory.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {newCategory.type === 'expense' && (
                      <div>
                        <Label htmlFor="budget">Budget Mensile (opzionale)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={newCategory.budget}
                          onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Annulla
                      </Button>
                      <Button onClick={handleCreateCategory}>
                        Crea Categoria
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Expense Categories */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-expense mr-2">📉</span>
                  Categorie di Uscita ({expenseCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expenseCategories.map(category => (
                    <div
                      key={category.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            {category.icon}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {category.budget && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center justify-between">
                            <span>Budget mensile:</span>
                            <span className="font-semibold">{formatCurrency(category.budget)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Income Categories */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-success mr-2">📈</span>
                  Categorie di Entrata ({incomeCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incomeCategories.map(category => (
                    <div
                      key={category.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            {category.icon}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

export default Categories;
