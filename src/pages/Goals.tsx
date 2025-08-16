
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceContext';
import { SavingsGoal } from '@/types';
import { Plus, Edit, Trash2, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [open, setOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<{ id: string; title: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    color: '#3b82f6',
    isCompleted: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      color: '#3b82f6',
      isCompleted: false
    });
    setEditingGoalId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error('Per favore, compila tutti i campi obbligatori.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingGoalId) {
        await updateGoal(editingGoalId, formData);
        toast.success('Obiettivo aggiornato con successo!');
      } else {
        await addGoal(formData);
        toast.success('Obiettivo creato con successo!');
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Errore nel salvare l\'obiettivo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      color: goal.color,
      isCompleted: goal.isCompleted
    });
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;
    setDeletingId(goalToDelete.id);
    try {
      await deleteGoal(goalToDelete.id);
      toast.success('Obiettivo eliminato con successo!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error("Errore nell'eliminare l'obiettivo");
    } finally {
      setDeletingId(null);
      setDeleteOpen(false);
      setGoalToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const completedGoals = goals.filter(goal => goal.isCompleted);
  const activeGoals = goals.filter(goal => !goal.isCompleted);

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Obiettivi di Risparmio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Raggiungi i tuoi traguardi finanziari
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Obiettivo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingGoalId ? 'Modifica Obiettivo' : 'Nuovo Obiettivo'}
                </DialogTitle>
                <DialogDescription>
                  {editingGoalId 
                    ? 'Modifica i dettagli del tuo obiettivo di risparmio.'
                    : 'Crea un nuovo obiettivo per raggiungere i tuoi traguardi finanziari.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Titolo *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Es. Vacanze in Italia"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrizione</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrizione opzionale"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="targetAmount">Obiettivo (€) *</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetAmount || ''}
                      onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="1000"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentAmount">Importo Attuale (€)</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.currentAmount || ''}
                      onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline">Scadenza *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="color">Colore</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      checked={formData.isCompleted}
                      onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isCompleted">Obiettivo completato</Label>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? (editingGoalId ? 'Aggiornamento…' : 'Creazione…') : `${editingGoalId ? 'Aggiorna' : 'Crea'} Obiettivo`}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
                    Annulla
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-brand-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Obiettivi Totali
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {goals.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completati
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completedGoals.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-brand-secondary" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Valore Totale
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nessun obiettivo ancora
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Inizia a creare i tuoi primi obiettivi di risparmio
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crea il tuo primo obiettivo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const isOverdue = new Date(goal.deadline) < new Date() && !goal.isCompleted;
              
              return (
                <Card key={goal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                      </div>
                      <Badge variant={goal.isCompleted ? "default" : isOverdue ? "destructive" : "secondary"}>
                        {goal.isCompleted ? 'Completato' : isOverdue ? 'Scaduto' : 'In corso'}
                      </Badge>
                    </div>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      {(() => {
                        const barStyle = { ['--progress-foreground' as string]: goal.color } as React.CSSProperties;
                        return (
                          <Progress 
                            value={progressPercentage} 
                            className="h-2"
                            style={barStyle}
                          />
                        );
                      })()}
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{progressPercentage.toFixed(1)}%</span>
                        <span>
                          {formatCurrency(goal.targetAmount - goal.currentAmount)} rimanenti
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Scadenza: {formatDate(goal.deadline)}</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifica
                      </Button>
                      <Dialog open={deleteOpen && goalToDelete?.id === goal.id} onOpenChange={(v) => {
                        if (!v) { setDeleteOpen(false); setGoalToDelete(null); }
                      }}>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => { setGoalToDelete({ id: goal.id, title: goal.title }); setDeleteOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Eliminare questo obiettivo?</DialogTitle>
                            <DialogDescription>
                              Questa azione non può essere annullata. Verrà eliminato l'obiettivo
                              {goalToDelete?.title ? ` "${goalToDelete.title}"` : ''} e tutti i dati associati.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => { setDeleteOpen(false); setGoalToDelete(null); }}>
                              Annulla
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                              Elimina
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Goals;
