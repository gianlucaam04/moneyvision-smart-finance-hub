
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestItem {
  id: string;
  category: string;
  description: string;
  completed: boolean;
}

const TestChecklist: React.FC = () => {
  const [testItems, setTestItems] = useState<TestItem[]>([
    // Autenticazione
    { id: 'auth-1', category: 'Autenticazione', description: 'Login con credenziali valide', completed: false },
    { id: 'auth-2', category: 'Autenticazione', description: 'Login con credenziali non valide', completed: false },
    { id: 'auth-3', category: 'Autenticazione', description: 'Logout corretto', completed: false },
    { id: 'auth-4', category: 'Autenticazione', description: 'Reset password via email', completed: false },
    { id: 'auth-5', category: 'Autenticazione', description: 'Protezione route private', completed: false },
    
    // Categorie
    { id: 'cat-1', category: 'Categorie', description: 'Creazione nuova categoria', completed: false },
    { id: 'cat-2', category: 'Categorie', description: 'Modifica categoria esistente', completed: false },
    { id: 'cat-3', category: 'Categorie', description: 'Eliminazione categoria', completed: false },
    { id: 'cat-4', category: 'Categorie', description: 'Impostazione budget categoria', completed: false },
    
    // Transazioni
    { id: 'trans-1', category: 'Transazioni', description: 'Aggiunta spesa', completed: false },
    { id: 'trans-2', category: 'Transazioni', description: 'Aggiunta entrata', completed: false },
    { id: 'trans-3', category: 'Transazioni', description: 'Modifica transazione', completed: false },
    { id: 'trans-4', category: 'Transazioni', description: 'Eliminazione transazione', completed: false },
    { id: 'trans-5', category: 'Transazioni', description: 'Filtro transazioni per data', completed: false },
    
    // Obiettivi
    { id: 'goal-1', category: 'Obiettivi', description: 'Creazione obiettivo di risparmio', completed: false },
    { id: 'goal-2', category: 'Obiettivi', description: 'Aggiornamento progresso obiettivo', completed: false },
    { id: 'goal-3', category: 'Obiettivi', description: 'Completamento obiettivo', completed: false },
    
    // Dashboard e Analytics
    { id: 'dash-1', category: 'Dashboard', description: 'Visualizzazione saldo corrente', completed: false },
    { id: 'dash-2', category: 'Dashboard', description: 'Grafici spese per categoria', completed: false },
    { id: 'dash-3', category: 'Dashboard', description: 'Ultime transazioni', completed: false },
    { id: 'ana-1', category: 'Analytics', description: 'Grafici trend mensili', completed: false },
    { id: 'ana-2', category: 'Analytics', description: 'Analisi budget vs spese', completed: false },
    
    // Responsive
    { id: 'resp-1', category: 'Responsive', description: 'Layout mobile corretto', completed: false },
    { id: 'resp-2', category: 'Responsive', description: 'Navigation mobile funzionante', completed: false },
    { id: 'resp-3', category: 'Responsive', description: 'Form responsive su mobile', completed: false },
    { id: 'resp-4', category: 'Responsive', description: 'Grafici responsive', completed: false },
  ]);

  const toggleItem = (id: string) => {
    setTestItems(items => 
      items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const resetAll = () => {
    setTestItems(items => items.map(item => ({ ...item, completed: false })));
  };

  const categories = Array.from(new Set(testItems.map(item => item.category)));
  const completedItems = testItems.filter(item => item.completed).length;
  const totalItems = testItems.length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">
              Checklist Testing MoneyVision
            </CardTitle>
            <CardDescription>
              Verifica funzionale completa dell'applicazione
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-finance-blue">
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-600">
              {completedItems}/{totalItems} completati
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-finance-blue to-finance-green h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={resetAll} variant="outline">
            Reset Tutti
          </Button>
          <div className="flex space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>In corso</span>
            </Badge>
            <Badge variant="default" className="flex items-center space-x-1 bg-success">
              <CheckCircle className="w-3 h-3" />
              <span>Completato</span>
            </Badge>
          </div>
        </div>

        {categories.map(category => {
          const categoryItems = testItems.filter(item => item.category === category);
          const categoryCompleted = categoryItems.filter(item => item.completed).length;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category}
                </h3>
                <Badge variant="outline">
                  {categoryCompleted}/{categoryItems.length}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {categoryItems.map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                      item.completed 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <span className={`flex-1 ${
                      item.completed 
                        ? 'text-green-800 dark:text-green-200 line-through' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.description}
                    </span>
                    {item.completed && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TestChecklist;
