
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
    }
  };

  const handleSave = async () => {
    const success = await updateUserProfile({ name, email });
    if (success) {
      navigate('/settings');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profilo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestisci le informazioni del tuo account
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-16 w-16 mb-4">
              <AvatarFallback>{user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <CardTitle>Modifica Profilo</CardTitle>
            <CardDescription>Aggiorna il tuo nome e email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </CardContent>
        </Card>

        <div>
          <Button variant="outline" className="w-full" onClick={() => setShowPasswordDialog(true)}>
            Cambia Password
          </Button>
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambia Password</DialogTitle>
              <DialogDescription>Inserisci la password attuale e la nuova password.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="oldPassword">Password Attuale</Label>
                <Input id="oldPassword" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newPassword">Nuova Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Annulla</Button>
              <Button onClick={handlePasswordChange}>Salva</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Profile;
