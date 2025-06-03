
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CirclePlus, Target, Calendar, DollarSign, Edit, Trash2, TrendingUp } from 'lucide-react';

const Goals: React.FC = () => {
  const { savingsGoals } = useFinance();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: '',
    color: '#10B981'
  });

  const predefinedColors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
    '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
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

  const calculateTimeRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Scaduto';
    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return '1 giorno';
    if (diffDays < 30) return `${diffDays} giorni`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi`;
    return `${Math.floor(diffDays / 365)} anni`;
  };

  const handleCreateGoal = () => {
    if (newGoal.title.trim() && newGoal.targetAmount && newGoal.deadline) {
      // In a real app, this would be saved to the database
      console.log('Creating new goal:', newGoal);
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        description: '',
        color: '#10B981'
      });
      setIsCreateDialogOpen(false);
    }
  };

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

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Obiettivi di Risparmio
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Pianifica e raggiungi i tuoi obiettivi finanziari
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <CirclePlus className="w-4 h-4 mr-2" />
                    Nuovo Obiettivo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Crea Nuovo Obiettivo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goalTitle">Nome Obiettivo</Label>
                      <Input
                        id="goalTitle"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                        placeholder="Es. Vacanza in Giappone"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="targetAmount">Importo Obiettivo</Label>
                        <Input
                          id="targetAmount"
                          type="number"
                          value={newGoal.targetAmount}
                          onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentAmount">Importo Attuale</Label>
                        <Input
                          id="currentAmount"
                          type="number"
                          value={newGoal.currentAmount}
                          onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="deadline">Data Scadenza</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Colore</Label>
                      <div className="grid grid-cols-10 gap-2 mt-2">
                        {predefinedColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewGoal({...newGoal, color})}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newGoal.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrizione (opzionale)</Label>
                      <Textarea
                        id="description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                        placeholder="Aggiungi dettagli sul tuo obiettivo..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Obiettivi Attivi</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeGoals.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-finance-blue" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Obiettivi Completati</p>
                      <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Totale Risparmiato</p>
                      <p className="text-2xl font-bold text-finance-green">
                        {formatCurrency(savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0))}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-finance-green" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-finance-blue" />
                    Obiettivi Attivi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeGoals.map(goal => {
                      const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                      const timeRemaining = calculateTimeRemaining(goal.deadline);
                      
                      return (
                        <div
                          key={goal.id}
                          className="border rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                {goal.title}
                              </h3>
                              {goal.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-4">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Progresso</span>
                              <span className="font-semibold">{progress.toFixed(1)}%</span>
                            </div>
                            
                            <Progress 
                              value={progress} 
                              className="h-3"
                              style={{ 
                                background: `${goal.color}20`
                              }}
                            />
                            
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium">
                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {timeRemaining}
                              </span>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-3"
                              style={{ borderColor: goal.color, color: goal.color }}
                            >
                              Aggiungi Denaro
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-success" />
                    Obiettivi Completati
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {completedGoals.map(goal => (
                      <div
                        key={goal.id}
                        className="border rounded-lg p-4 bg-gradient-to-r from-success/10 to-success/5 border-success/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {goal.title}
                          </h3>
                          <span className="text-2xl">🎉</span>
                        </div>
                        <p className="text-success font-medium">
                          {formatCurrency(goal.targetAmount)} raggiunti!
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {savingsGoals.length === 0 && (
              <Card className="animate-fade-in">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nessun obiettivo ancora
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Inizia a pianificare il tuo futuro finanziario creando il tuo primo obiettivo di risparmio.
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white"
                  >
                    <CirclePlus className="w-4 h-4 mr-2" />
                    Crea il Primo Obiettivo
                  </Button>
                </CardContent>
              </Card>
            )}
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

export default Goals;
