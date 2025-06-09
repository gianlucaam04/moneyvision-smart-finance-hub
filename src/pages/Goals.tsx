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
import { Plus, Edit, Trash2, Target, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#000000');
  const [isCompleted, setIsCompleted] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setDeadline('');
    setColor('#000000');
    setIsCompleted(false);
    setEditingGoalId(null);
  };

  const handleAddGoal = async () => {
    if (!title || !targetAmount || !deadline) {
      toast.error('Per favore, compila tutti i campi.');
      return;
    }

    const newGoal = {
      title,
      description,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline,
      color,
      isCompleted,
    };

    await addGoal(newGoal);
    toast.success('Obiettivo aggiunto con successo!');
    setOpen(false);
    resetForm();
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setDeadline(goal.deadline);
    setColor(goal.color);
    setIsCompleted(goal.isCompleted);
    setOpen(true);
  };

  const handleUpdateGoal = async () => {
    if (!title || !targetAmount || !deadline) {
      toast.error('Per favore, compila tutti i campi.');
      return;
    }

    if (!editingGoalId) {
      toast.error('Nessun obiettivo da modificare.');
      return;
    }

    const updatedGoal = {
      title,
      description,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline,
      color,
      isCompleted,
    };

    await updateGoal(editingGoalId, updatedGoal);
    toast.success('Obiettivo modificato con successo!');
    setOpen(false);
    resetForm();
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    toast.success('Obiettivo eliminato con successo!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Obiettivi di Risparmio</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestisci i tuoi obiettivi di risparmio</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Obiettivo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoalId ? 'Modifica Obiettivo' : 'Aggiungi Obiettivo'}</DialogTitle>
                <DialogDescription>
                  {editingGoalId
                    ? 'Modifica i dettagli del tuo obiettivo di risparmio.'
                    : 'Crea un nuovo obiettivo di risparmio per raggiungere i tuoi traguardi finanziari.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Titolo
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descrizione
                  </Label>
                  <Input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetAmount" className="text-right">
                    Importo Target
                  </Label>
                  <Input
                    type="number"
                    id="targetAmount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentAmount" className="text-right">
                    Importo Attuale
                  </Label>
                  <Input
                    type="number"
                    id="currentAmount"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">
                    Scadenza
                  </Label>
                  <Input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Colore
                  </Label>
                  <Input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isCompleted" className="text-right">
                    Completato
                  </Label>
                  <input
                    type="checkbox"
                    id="isCompleted"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={editingGoalId ? handleUpdateGoal : handleAddGoal}>
                {editingGoalId ? 'Aggiorna Obiettivo' : 'Aggiungi Obiettivo'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: goal.color }} />
                  {goal.title}
                </CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {goal.currentAmount}€ / {goal.targetAmount}€
                    </span>
                    <Badge variant="secondary">
                      {goal.isCompleted ? 'Completato' : 'In corso'}
                    </Badge>
                  </div>
                  <Progress
                    value={(goal.currentAmount / goal.targetAmount) * 100}
                    style={{ backgroundColor: goal.color }}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Scadenza: {new Date(goal.deadline).toLocaleDateString()}</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Elimina
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Goals;
