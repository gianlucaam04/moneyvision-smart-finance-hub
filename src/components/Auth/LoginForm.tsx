import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import ForgotPassword from './ForgotPassword';

const schema = z.object({
  email: z.string().email({ message: 'Email non valida' }),
  password: z.string().nonempty({ message: 'Password richiesta' }),
});

type FormData = z.infer<typeof schema>;

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // PWA install helpers
  // beforeinstallprompt is not in TS lib by default, so define the minimal shape we need
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const isStandalone = () => {
    if (typeof window === 'undefined') return false;
    // iOS Safari uses navigator.standalone; others use display-mode
    type NavigatorStandalone = Navigator & { standalone?: boolean };
    const navAny = navigator as NavigatorStandalone;
    return (
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      navAny?.standalone === true
    );
  };

  const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  };

  useEffect(() => {
    if (isStandalone()) return; // già installata, non mostrare

    const handleBeforeInstall = (e: Event) => {
      const ev = e as BeforeInstallPromptEvent;
      ev.preventDefault();
      setDeferredPrompt(ev);
      setIsInstallable(true);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
    window.addEventListener('appinstalled', handleInstalled as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', handleInstalled as EventListener);
    };
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    if (blocked) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const success = await login(DOMPurify.sanitize(data.email), data.password);
      if (!success) {
        setErrorCount(c => {
          const next = c + 1;
          if (next >= 5) setBlocked(true);
          return next;
        });
        toast({ title: 'Errore di accesso', description: 'Credenziali non valide', variant: 'destructive' });
      } else {
        toast({ title: 'Accesso effettuato', description: 'Benvenuto in MoneyVision!' });
      }
    }, 500);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full blur-lg opacity-20 animate-pulse"></div>
            <img
              src="/icons/android-chrome-192x192.png"
              alt="MoneyVision logo"
              className="relative mx-auto w-20 h-20 rounded-2xl shadow-lg ring-4 ring-brand-primary/20"
              width={80}
              height={80}
              loading="eager"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              MoneyVision
            </CardTitle>
            <CardDescription className="text-brand-accent/80 dark:text-gray-300 font-medium">
              Il tuo tracker finanziario intelligente
            </CardDescription>
          </div>
          {/* PWA Install CTA */}
          {!isStandalone() && (
            <div className="pt-4">
              {isIOS() ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-brand-primary/30 text-brand-primary hover:bg-brand-light/50 hover:border-brand-primary/50 transition-all duration-300"
                  onClick={() => {
                    // Istruzioni per iOS
                    alert(
                      'Per aggiungere alla Home su iPhone/iPad:\n1) Tocca il pulsante Condividi (quadrato con freccia).\n2) Seleziona "Aggiungi a Home".\n3) Conferma con Aggiungi.'
                    );
                  }}
                >
                  📱 Aggiungi alla Home
                </Button>
              ) : (
                isInstallable && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-brand-primary/30 text-brand-primary hover:bg-brand-light/50 hover:border-brand-primary/50 transition-all duration-300"
                    onClick={async () => {
                      try {
                        if (!deferredPrompt) return;
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        if (outcome === 'accepted') {
                          setDeferredPrompt(null);
                          setIsInstallable(false);
                        }
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    📱 Aggiungi alla Home
                  </Button>
                )
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-brand-accent font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                aria-invalid={!!errors.email}
                className="h-12 border-brand-primary/20 focus:border-brand-primary focus:ring-brand-primary/20 rounded-xl transition-all duration-300"
                placeholder="inserisci@email.com"
              />
              {errors.email && <p role="alert" className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-brand-accent font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                aria-invalid={!!errors.password}
                className="h-12 border-brand-primary/20 focus:border-brand-primary focus:ring-brand-primary/20 rounded-xl transition-all duration-300"
                placeholder="••••••••"
              />
              {errors.password && <p role="alert" className="text-red-500 text-sm font-medium">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-accent hover:to-brand-primary text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-brand-primary/25"
              disabled={isSubmitting || isLoading || blocked}
            >
              {blocked ? '🔒 Bloccato. Riprova più tardi' : (isSubmitting || isLoading) ? '⏳ Verifica...' : '🚀 Accedi'}
            </Button>
            
            <div className="text-center pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-brand-primary hover:text-brand-accent hover:bg-brand-light/30 rounded-lg transition-all duration-300"
              >
                🔑 Password dimenticata?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
