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
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full blur-lg opacity-20 animate-pulse"></div>
            <div className="relative mx-auto w-20 h-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg ring-4 ring-brand-primary/20">
              <span className="text-white font-bold text-3xl">✓</span>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Email Inviata
            </CardTitle>
            <CardDescription className="text-brand-accent/80 dark:text-gray-300 font-medium">
              Ti abbiamo inviato le istruzioni per resettare la password
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            <div className="text-center p-4 bg-brand-light/30 rounded-xl border border-brand-primary/20">
              <p className="text-sm text-brand-accent dark:text-gray-300 font-medium">
                📧 Controlla la tua casella email e segui le istruzioni per resettare la password.
              </p>
            </div>
            
            <Button 
              onClick={onBackToLogin}
              variant="outline"
              className="w-full h-12 border-brand-primary/30 text-brand-primary hover:bg-brand-light/50 hover:border-brand-primary/50 rounded-xl transition-all duration-300"
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
    <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardHeader className="text-center space-y-6 pb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full blur-lg opacity-20 animate-pulse"></div>
          <div className="relative mx-auto w-20 h-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg ring-4 ring-brand-primary/20">
            <span className="text-white font-bold text-2xl">🔑</span>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Recupera Password
          </CardTitle>
          <CardDescription className="text-brand-accent/80 dark:text-gray-300 font-medium">
            Inserisci la tua email per ricevere le istruzioni di reset
          </CardDescription>
        </div>
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
              placeholder="inserisci@email.com"
              className="h-12 border-brand-primary/20 focus:border-brand-primary focus:ring-brand-primary/20 rounded-xl transition-all duration-300"
              required
            />
            {errors.email && <p role="alert" className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-accent hover:to-brand-primary text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-brand-primary/25"
            disabled={isSubmitting || blocked}
          >
            {blocked ? '🔒 Bloccato. Riprova più tardi' : isSubmitting ? '⏳ Invio...' : '📧 Invia Email di Reset'}
          </Button>
          
          <Button 
            type="button"
            onClick={onBackToLogin}
            variant="outline"
            className="w-full h-12 border-brand-primary/30 text-brand-primary hover:bg-brand-light/50 hover:border-brand-primary/50 rounded-xl transition-all duration-300"
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
