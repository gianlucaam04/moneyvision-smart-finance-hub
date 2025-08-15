import React, { useState, useRef } from 'react';
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
      <div className="min-h-screen bg-gradient-to-br from-finance-blue/20 via-white to-finance-green/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-finance-blue/20 via-white to-finance-green/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <img
            src="/icons/android-chrome-192x192.png"
            alt="MoneyVision logo"
            className="mx-auto w-16 h-16 rounded-xl shadow-sm"
            width={64}
            height={64}
            loading="eager"
          />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            MoneyVision
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Il tuo tracker finanziario intelligente
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
              {errors.email && <p role="alert" className="text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} aria-invalid={!!errors.password} />
              {errors.password && <p role="alert" className="text-red-500">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
              disabled={isSubmitting || isLoading || blocked}
            >
              {blocked ? 'Bloccato. Riprova più tardi' : (isSubmitting || isLoading) ? 'Verifica...' : 'Accedi'}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-finance-blue hover:text-finance-blue/80"
              >
                Password dimenticata?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
