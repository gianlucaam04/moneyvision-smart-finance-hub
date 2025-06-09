import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceContext';
import { Category } from '@/types';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { toast } from 'sonner';

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    color: '#7dd3fc',
    icon: 'CreditCard',
    type: 'expense',
    budget: 0
  });
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (formData.name.trim() === '') {
      toast.error('Il nome della categoria è obbligatorio.');
      return;
    }

    await addCategory(formData);
    toast.success('Categoria aggiunta con successo!');
    setFormData({ name: '', color: '#7dd3fc', icon: 'CreditCard', type: 'expense', budget: 0 });
    setOpen(false);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ ...category });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    await updateCategory(selectedCategory.id, formData);
    toast.success('Categoria aggiornata con successo!');
    setEditOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    toast.success('Categoria eliminata con successo!');
  };

  const filteredCategories = filterType === 'all'
    ? categories
    : categories.filter(cat => cat.type === filterType);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categorie</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestisci le tue categorie di entrate e uscite</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Categoria</DialogTitle>
                <DialogDescription>
                  Aggiungi una nuova categoria per tenere traccia delle tue transazioni.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'type')}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleziona un tipo" defaultValue={formData.type} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Entrata</SelectItem>
                      <SelectItem value="expense">Uscita</SelectItem>
                      <SelectItem value="both">Entrambi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Colore
                  </Label>
                  <Input type="color" id="color" name="color" value={formData.color} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="icon" className="text-right">
                    Icona
                  </Label>
                  <Input id="icon" name="icon" value={formData.icon} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget" className="text-right">
                    Budget
                  </Label>
                  <Input type="number" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} className="col-span-3" />
                </div>
              </div>
              <Button onClick={handleSubmit}>Aggiungi</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-4">
          <Select onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="income">Entrate</SelectItem>
              <SelectItem value="expense">Uscite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {category.type === 'income' && <TrendingUp className="text-green-500" />}
                    {category.type === 'expense' && <TrendingDown className="text-red-500" />}
                    <span>{category.name}</span>
                  </div>
                  <Badge className="opacity-75">{category.type}</Badge>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{category.budget}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end space-x-2">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Modifica Categoria
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Categoria</DialogTitle>
            <DialogDescription>
              Modifica i dettagli della categoria selezionata.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select onValueChange={(value) => handleSelectChange(value, 'type')} defaultValue={formData.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrata</SelectItem>
                  <SelectItem value="expense">Uscita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Colore
              </Label>
              <Input type="color" id="color" name="color" value={formData.color} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icona
              </Label>
              <Input id="icon" name="icon" value={formData.icon} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input type="number" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleUpdate}>Aggiorna</Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Categories;
