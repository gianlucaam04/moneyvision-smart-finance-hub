import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({ email: z.string().email({ message: 'Email non valida' }) });
type FormData = z.infer<typeof schema>;

const ForgotPassword: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    if (blocked) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(DOMPurify.sanitize(data.email), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) {
        setErrorCount(c => {
          const next = c + 1;
          if (next >= 5) setBlocked(true);
          return next;
        });
        toast({ title: 'Errore', description: error.message, variant: 'destructive' });
      } else {
        setEmailSent(true);
        toast({ title: 'Email inviata', description: 'Controlla la tua email per le istruzioni di reset' });
      }
    }, 500);
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-finance-blue to-finance-green rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">✓</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Inviata
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Ti abbiamo inviato le istruzioni per resettare la password
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Controlla la tua casella email e segui le istruzioni per resettare la password.
            </p>
            
            <Button 
              onClick={onBackToLogin}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-finance-blue to-finance-green rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-2xl">MV</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Recupera Password
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Inserisci la tua email per ricevere le istruzioni di reset
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              placeholder="Inserisci la tua email"
              className="w-full"
              required
            />
            {errors.email && <p role="alert" className="text-red-500">{errors.email.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-finance-blue to-finance-green hover:from-finance-blue/90 hover:to-finance-green/90 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            disabled={isSubmitting || blocked}
          >
            {blocked ? 'Bloccato. Riprova più tardi' : isSubmitting ? 'Invio...' : 'Invia Email di Reset'}
          </Button>
          
          <Button 
            type="button"
            onClick={onBackToLogin}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
