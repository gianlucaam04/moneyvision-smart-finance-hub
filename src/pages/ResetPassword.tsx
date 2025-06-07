import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const schema = z.object({
  newPassword: z.string().min(6, 'Minimo 6 caratteri'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [blocked, setBlocked] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const params = new URLSearchParams(search);
    const errDesc = params.get('error_description');
    if (errDesc) {
      toast({ title: 'Errore reset password', description: errDesc, variant: 'destructive' });
      return;
    }
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
  }, [search]);

  const onSubmit = (data: FormData) => {
    if (blocked) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) {
        setErrorCount(c => { const next = c+1; if (next>=5) setBlocked(true); return next; });
        toast({ title: 'Errore', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✅ Password aggiornata', description: 'Password aggiornata con successo.' });
        setIsSuccess(true);
      }
    }, 500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Password aggiornata!</CardTitle>
            <CardDescription>Ora puoi effettuare il login.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">Vai al Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Reset Password</h2>
        {errors.confirmPassword && <p role="alert" className="text-sm text-red-500 mb-2">{errors.confirmPassword.message}</p>}
        <div>
          <Label htmlFor="newPassword">Nuova Password</Label>
          <Input id="newPassword" type="password" {...register('newPassword')} aria-invalid={!!errors.newPassword} className="mt-1"/>
          {errors.newPassword && <p role="alert" className="text-sm text-red-500">{errors.newPassword.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Conferma Password</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} className="mt-1"/>
          {errors.confirmPassword && <p role="alert" className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || blocked}>
          {blocked ? 'Bloccato. Riprova più tardi' : isSubmitting ? 'Aggiornamento...' : 'Aggiorna Password'}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
