
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { User, Lock, Save, KeyRound } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUserProfile, changePassword, isLoading } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Le password non corrispondono');
      return;
    }
    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setShowPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "🔒 Password aggiornata",
        description: "La tua password è stata cambiata con successo.",
      });
    }
  };

  const handleSave = async () => {
    const success = await updateUserProfile({ name, email });
    if (success) {
      toast({
        title: "✅ Profilo aggiornato",
        description: "Le informazioni del tuo profilo sono state salvate.",
      });
      navigate('/settings');
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profilo Utente
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestisci le informazioni del tuo account
          </p>
        </div>

        {/* User Info Card */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-finance-blue text-white text-xl">
                  {user?.name ? getUserInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Informazioni Personali
            </CardTitle>
            <CardDescription>
              Aggiorna il tuo nome e indirizzo email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Inserisci il tuo nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Indirizzo Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="Inserisci la tua email"
              />
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Sicurezza Account
            </CardTitle>
            <CardDescription>
              Gestisci la sicurezza del tuo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowPasswordDialog(true)}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Cambia Password
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambia Password</DialogTitle>
              <DialogDescription>
                Inserisci la password attuale e la nuova password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="oldPassword">Password Attuale</Label>
                <Input 
                  id="oldPassword" 
                  type="password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nuova Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                />
              </div>
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Annulla
              </Button>
              <Button onClick={handlePasswordChange}>
                Salva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Profile;
