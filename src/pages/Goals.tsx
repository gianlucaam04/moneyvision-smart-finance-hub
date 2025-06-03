
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CirclePlus, Target, Calendar, TrendingUp, DollarSign, Brain, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Goals: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal } = useFinance();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    description: '',
    color: '#3B82F6'
  });

  const goalColors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateGoal = () => {
    if (newGoal.title.trim() && newGoal.targetAmount && newGoal.deadline) {
      const goalData = {
        title: newGoal.title,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline,
        description: newGoal.description,
        color: newGoal.color,
        isCompleted: false
      };
      
      addSavingsGoal(goalData);
      setNewGoal({ title: '', targetAmount: '', deadline: '', description: '', color: '#3B82F6' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "🎯 Obiettivo creato",
        description: `L'obiettivo "${newGoal.title}" è stato aggiunto con successo.`,
      });
    }
  };

  const handleAddToGoal = (goalId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      updateSavingsGoal(goalId, newAmount);
      
      toast({
        title: "💰 Importo aggiunto",
        description: `Hai aggiunto ${formatCurrency(amount)} al tuo obiettivo!`,
      });
    }
  };

  // AI Smart Suggestions per gli obiettivi
  const aiGoalSuggestions = [
    {
      type: 'achievement',
      icon: '🎉',
      title: 'Obiettivo Quasi Raggiunto!',
      message: 'Ti mancano solo €150 per raggiungere il tuo obiettivo "Vacanza Estiva". Continua così!',
      action: 'Aggiungi Fondi',
      priority: 'high',
      goalId: '1'
    },
    {
      type: 'suggestion',
      icon: '💡',
      title: 'Nuovo Obiettivo Suggerito',
      message: 'Basandoci sui tuoi risparmi, potresti creare un fondo emergenza di €3.000.',
      action: 'Crea Obiettivo',
      priority: 'medium'
    },
    {
      type: 'optimization',
      icon: '📊',
      title: 'Ottimizza i Risparmi',
      message: 'Riducendo le spese per intrattenimento del 20%, potresti raggiungere i tuoi obiettivi 2 mesi prima.',
      action: 'Mostra Piano',
      priority: 'medium'
    }
  ];

  const activeGoals = savingsGoals.filter(goal => !goal.isCompleted);
  const completedGoals = savingsGoals.filter(goal => goal.isCompleted);

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
                  Obiettivi di Risparmio
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Raggiungi i tuoi traguardi finanziari
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <CirclePlus className="w-4 h-4 mr-2" />
                    Nuovo Obiettivo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Crea Nuovo Obiettivo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goalTitle">Titolo Obiettivo</Label>
                      <Input
                        id="goalTitle"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                        placeholder="Es. Vacanza Estiva"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="targetAmount">Importo Obiettivo</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                        placeholder="1500"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deadline">Data Scadenza</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrizione (opzionale)</Label>
                      <Input
                        id="description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                        placeholder="Viaggio in Grecia"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Colore</Label>
                      <div className="grid grid-cols-10 gap-2 mt-2">
                        {goalColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewGoal({...newGoal, color})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              newGoal.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Annulla
                      </Button>
                      <Button onClick={handleCreateGoal}>
                        Crea Obiettivo
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* AI Smart Suggestions */}
            <Card className="animate-fade-in border-l-4 border-l-finance-green">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-finance-green" />
                  AI Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiGoalSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                        suggestion.priority === 'high' 
                          ? 'bg-green-50 border-l-green-400 dark:bg-green-900/20' 
                          : 'bg-blue-50 border-l-blue-400 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {suggestion.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="hover:bg-finance-green hover:text-white"
                            onClick={() => suggestion.goalId && handleAddToGoal(suggestion.goalId, 150)}
                          >
                            {suggestion.action}
                          </Button>
                          <Button size="sm" variant="ghost">
                            Ignora
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-finance-blue" />
                  Obiettivi Attivi ({activeGoals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">Nessun obiettivo attivo</p>
                    <p className="text-sm">Inizia creando il tuo primo obiettivo di risparmio</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeGoals.map(goal => {
                      const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                      const daysLeft = getDaysLeft(goal.deadline);
                      
                      return (
                        <div
                          key={goal.id}
                          className="border rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 hover:scale-105"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${goal.color}20` }}
                              >
                                <Target className="w-6 h-6" style={{ color: goal.color }} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {goal.title}
                                </h3>
                                {goal.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {goal.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">Progresso</span>
                                <span>{progress.toFixed(1)}%</span>
                              </div>
                              <Progress 
                                value={progress} 
                                className="h-3"
                                style={{ 
                                  background: `${goal.color}20`
                                }}
                              />
                              <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-gray-300">
                                <span>{formatCurrency(goal.currentAmount)}</span>
                                <span>{formatCurrency(goal.targetAmount)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {daysLeft > 0 
                                    ? `${daysLeft} giorni rimasti` 
                                    : daysLeft === 0 
                                    ? 'Scade oggi!' 
                                    : `Scaduto da ${Math.abs(daysLeft)} giorni`
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                style={{ backgroundColor: goal.color }}
                                onClick={() => {
                                  const amount = prompt('Inserisci l\'importo da aggiungere:');
                                  if (amount && !isNaN(Number(amount))) {
                                    handleAddToGoal(goal.id, Number(amount));
                                  }
                                }}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Aggiungi Fondi
                              </Button>
                              <Button size="sm" variant="outline">
                                Dettagli
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success" />
                    Obiettivi Completati ({completedGoals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedGoals.map(goal => (
                      <div
                        key={goal.id}
                        className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="w-6 h-6 text-success" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {goal.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Completato: {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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

export default Goals;
