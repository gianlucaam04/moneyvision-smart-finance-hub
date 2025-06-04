
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';

const OnboardingDialog: React.FC = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user was just created (within last 5 minutes)
    if (user) {
      const userCreatedAt = new Date(user.id); // In real implementation, you'd get this from profile
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // For demo purposes, show onboarding for new sessions
      const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user.id}`);
      
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const onboardingSteps = [
    {
      icon: Target,
      title: "Benvenuto in MoneyVision!",
      description: "La tua app per gestire le finanze personali in modo intelligente.",
      content: "Iniziamo con una breve guida per aiutarti a sfruttare al meglio tutte le funzionalità."
    },
    {
      icon: DollarSign,
      title: "Imposta i tuoi primi obiettivi",
      description: "Definisci obiettivi di risparmio realistici per raggiungere i tuoi sogni.",
      content: "Vai nella sezione 'Obiettivi' per creare il tuo primo obiettivo di risparmio. Che sia per una vacanza o un acquisto importante!"
    },
    {
      icon: TrendingUp,
      title: "Configura i budget",
      description: "Tieni sotto controllo le tue spese con budget personalizzati.",
      content: "Nella sezione 'Categorie' puoi impostare budget mensili per ogni categoria di spesa. Ti aiuteremo a non sforare!"
    },
    {
      icon: DollarSign,
      title: "Registra la tua prima transazione",
      description: "Inizia a tracciare entrate e uscite per avere il controllo completo.",
      content: "Vai in 'Transazioni' e aggiungi la tua prima spesa o entrata. Più dati inserisci, più precise saranno le analisi!"
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_seen_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Configurazione Iniziale
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-none shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-finance-blue to-finance-green rounded-full flex items-center justify-center mb-4">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">
              {currentStepData.title}
            </CardTitle>
            <CardDescription>
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              {currentStepData.content}
            </p>
            
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-finance-blue' 
                      : index < currentStep 
                        ? 'bg-finance-green' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleComplete}
                variant="outline"
                className="flex-1"
              >
                Salta
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90"
              >
                {currentStep < onboardingSteps.length - 1 ? (
                  <>
                    Avanti
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Inizia!'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
