
import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CirclePlus, Target, Calendar, Euro, Edit, Trash2, Brain, X, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Goals: React.FC = () => {
  const { toast } = useToast();
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('saving');
  const [editingGoal, setEditingGoal] = useState<any>(null);


  // Mock goals con dati realistici
  const [goals, setGoals] = useState([
    {
      id: '1',
      name: 'Vacanza Estiva',
      target: 2500,
      current: 1850,
      deadline: '2025-07-15',
      category: 'vacation',
      description: 'Viaggio in Grecia per 2 settimane',
      monthlyContribution: 200
    },
    {
      id: '2',
      name: 'Fondo Emergenza',
      target: 5000,
      current: 3200,
      deadline: '2025-12-31',
      category: 'emergency',
      description: 'Fondo di sicurezza per 6 mesi di spese',
      monthlyContribution: 300
    },
    {
      id: '3',
      name: 'Nuovo Laptop',
      target: 1200,
      current: 800,
      deadline: '2025-04-30',
      category: 'tech',
      description: 'MacBook Pro per lavoro',
      monthlyContribution: 150
    },
    {
      id: '4',
      name: 'Auto Nuova',
      target: 15000,
      current: 4500,
      deadline: '2026-06-01',
      category: 'vehicle',
      description: 'Toyota Hybrid usata',
      monthlyContribution: 500
    }
  ]);

  const categoryOptions = [
    { value: 'saving', label: '💰 Risparmio Generico', icon: '💰' },
    { value: 'vacation', label: '✈️ Vacanze', icon: '✈️' },
    { value: 'emergency', label: '🚨 Emergenza', icon: '🚨' },
    { value: 'tech', label: '💻 Tecnologia', icon: '💻' },
    { value: 'vehicle', label: '🚗 Veicoli', icon: '🚗' },
    { value: 'home', label: '🏠 Casa', icon: '🏠' },
    { value: 'education', label: '📚 Formazione', icon: '📚' },
    { value: 'health', label: '🏥 Salute', icon: '🏥' }
  ];



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.icon || '🎯';
  };

  const handleAddGoal = () => {
    if (newGoalName.trim() && newGoalTarget && newGoalDeadline) {
      const newGoal = {
        id: Date.now().toString(),
        name: newGoalName,
        target: parseFloat(newGoalTarget),
        current: 0,
        deadline: newGoalDeadline,
        category: newGoalCategory,
        description: '',
        monthlyContribution: 0
      };
      setGoals([...goals, newGoal]);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalDeadline('');
      setNewGoalCategory('saving');
      toast({
        title: "🎯 Obiettivo Creato",
        description: `"${newGoalName}" è stato aggiunto con successo.`,
      });
    }
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalTarget(goal.target.toString());
    setNewGoalDeadline(goal.deadline);
    setNewGoalCategory(goal.category);
  };

  const handleUpdateGoal = () => {
    if (editingGoal && newGoalName.trim() && newGoalTarget && newGoalDeadline) {
      setGoals(goals.map(goal => 
        goal.id === editingGoal.id 
          ? { 
              ...goal, 
              name: newGoalName, 
              target: parseFloat(newGoalTarget),
              deadline: newGoalDeadline,
              category: newGoalCategory
            }
          : goal
      ));
      setEditingGoal(null);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalDeadline('');
      setNewGoalCategory('saving');
      toast({
        title: "✅ Obiettivo Aggiornato",
        description: `"${newGoalName}" è stato modificato.`,
      });
    }
  };

  const handleDeleteGoal = (goal: any) => {
    const confirm = window.confirm(`Sei sicuro di voler eliminare "${goal.name}"?`);
    if (confirm) {
      setGoals(goals.filter(g => g.id !== goal.id));
      toast({
        title: "🗑️ Obiettivo Eliminato",
        description: `"${goal.name}" è stato rimosso.`,
      });
    }
  };

  // Funzione migliorata per aggiungere fondi agli obiettivi
  const addFunds = (goalId: string) => {
    const amount = prompt('Inserisci l\'importo da aggiungere (€):');
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      const numAmount = Number(amount);
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          // Limita l'importo al target se necessario
          const newCurrent = Math.min(goal.current + numAmount, goal.target);
          return { ...goal, current: newCurrent };
        }
        return goal;
      }));
      
      toast({
        title: "💰 Fondi Aggiunti",
        description: `${formatCurrency(numAmount)} aggiunti con successo all'obiettivo.`,
      });
    } else if (amount && (!isNaN(Number(amount)) && Number(amount) <= 0)) {
      toast({
        title: "⚠️ Importo non valido",
        description: "L'importo deve essere maggiore di zero.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <Navigation className="flex-col space-y-1" />
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-finance-blue" />
              <h1 className="text-xl font-bold">Obiettivi di Risparmio</h1>
            </div>
          </div>
          <div className="p-4 pb-24 lg:pb-4 max-w-6xl mx-auto space-y-6">
            {/* Quick Stats */}
            <Card className="animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg lg:text-xl">
                  <Target className="w-5 h-5 mr-2" />
                  Statistiche Obiettivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xl lg:text-2xl font-bold text-blue-600">
                      {goals.length}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                      Obiettivi Totali
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl lg:text-2xl font-bold text-green-600">
                      {goals.filter(goal => getProgress(goal.current, goal.target) >= 100).length}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                      Completati
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-xl lg:text-2xl font-bold text-yellow-600">
                      {goals.filter(goal => {
                        const days = getDaysRemaining(goal.deadline);
                        return days <= 30 && days > 0;
                      }).length}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                      In Scadenza
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-xl lg:text-2xl font-bold text-purple-600">
                      {formatCurrency(goals.reduce((sum, goal) => sum + goal.current, 0))}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                      Totale Risparmiato
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Header Section */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <Target className="h-6 w-6 text-finance-blue mr-2" />
                  I Tuoi Obiettivi di Risparmio
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Monitora i tuoi progressi e risparmia per realizzare i tuoi sogni.
                </p>
              </div>

              {/* Actions Row */}
              <div className="flex justify-between items-center flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-finance-blue hover:bg-finance-blue/90">
                      <CirclePlus size={18} />
                      Nuovo Obiettivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crea Nuovo Obiettivo di Risparmio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome dell'obiettivo</Label>
                        <Input
                          id="name" 
                          placeholder="es. Vacanza, Auto Nuova..."
                          value={newGoalName}
                          onChange={(e) => setNewGoalName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="target">Importo obiettivo (€)</Label>
                        <Input
                          id="target"
                          type="number"
                          placeholder="1000"
                          value={newGoalTarget}
                          onChange={(e) => setNewGoalTarget(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Data obiettivo</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={newGoalDeadline}
                          onChange={(e) => setNewGoalDeadline(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <span className="flex items-center gap-2">
                                  <span>{option.icon}</span>
                                  <span>{option.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <DialogTrigger asChild>
                        <Button variant="outline">Annulla</Button>
                      </DialogTrigger>
                      <Button 
                        onClick={handleAddGoal} 
                        className="bg-finance-blue hover:bg-finance-blue/90"
                      >
                        Salva Obiettivo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>


              </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {goals.map((goal) => {
                const progress = getProgress(goal.current, goal.target);
                const daysRemaining = getDaysRemaining(goal.deadline);
                const isOverdue = daysRemaining < 0;
                const isUrgent = daysRemaining <= 30 && daysRemaining > 0;
                
                return (
                  <Card key={goal.id} className={`animate-fade-in ${
                    isOverdue ? 'border-red-200 dark:border-red-800' :
                    isUrgent ? 'border-yellow-200 dark:border-yellow-800' :
                    progress >= 100 ? 'border-green-200 dark:border-green-800' :
                    'border-gray-200 dark:border-gray-700'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl flex-shrink-0">{getCategoryIcon(goal.category)}</span>
                          <div className="min-w-0">
                            <CardTitle className="text-base lg:text-lg truncate">{goal.name}</CardTitle>
                            {goal.description && (
                              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {goal.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                            className="p-1 h-auto"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal)}
                            className="p-1 h-auto hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                          </span>
                          <span className={`text-sm font-bold ${
                            progress >= 100 ? 'text-green-600' :
                            progress >= 75 ? 'text-blue-600' :
                            progress >= 50 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={`h-2 ${
                            progress >= 100 ? '[&>div]:bg-green-500' :
                            progress >= 75 ? '[&>div]:bg-blue-500' :
                            progress >= 50 ? '[&>div]:bg-yellow-500' :
                            '[&>div]:bg-gray-500'
                          }`}
                        />
                      </div>
                      
                      {/* Status and Deadline */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <div className={`flex items-center gap-1 ${
                          isOverdue ? 'text-red-600' :
                          isUrgent ? 'text-yellow-600' :
                          'text-gray-600 dark:text-gray-300'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          <span>
                            {isOverdue 
                              ? `Scaduto ${Math.abs(daysRemaining)} giorni fa`
                              : daysRemaining === 0
                              ? 'Scade oggi!'
                              : `${daysRemaining} giorni rimanenti`
                            }
                          </span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Scadenza: {formatDate(goal.deadline)}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => addFunds(goal.id)}
                          disabled={progress >= 100}
                          className="flex-1"
                          size="sm"
                        >
                          <Euro className="w-4 h-4 mr-1" />
                          Aggiungi Fondi
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast({
                            title: "📊 Dettagli Obiettivo",
                            description: `"${goal.name}" - Creato il ${new Date().toLocaleDateString('it-IT')}\nRisparmiati: ${formatCurrency(goal.current)}\nMancanti: ${formatCurrency(goal.target - goal.current)}\nContributo mensile: ${formatCurrency(goal.monthlyContribution)}`
                          })}
                          className="flex items-center gap-1"
                        >
                          <Target className="w-3.5 h-3.5" />
                          Dettagli
                        </Button>
                      </div>
                      
                      {/* Achievement Badge */}
                      {progress >= 100 && (
                        <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-lg">🎉</span>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                            Obiettivo Completato!
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Spazio aggiuntivo per il footer */}
            <div className="mb-24 lg:mb-0"></div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <Navigation className="flex flex-row justify-around items-center space-y-0" />
      </nav>
    </div>
  );
};

export default Goals;
