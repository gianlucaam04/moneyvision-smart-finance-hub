
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Settings as SettingsIcon, Download, Upload, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, updateUserPreferences, signOut } = useAuth();
  const { refreshData } = useFinance();
  const [isImporting, setIsImporting] = useState(false);

  // Default preferences se non disponibili
  const defaultPreferences = {
    theme: 'light',
    language: 'it',
    currency: 'EUR',
    notifications: true,
    autoBackup: false
  };

  const [preferences, setPreferences] = useState(user?.preferences || defaultPreferences);

  const handleSavePreferences = async () => {
    const success = await updateUserPreferences(preferences);
    if (success) {
      toast.success('Preferenze salvate con successo');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Qui dovrebbe essere implementata la logica di importazione
      console.log('Importing data:', data);
      
      // Refresh dei dati dopo l'importazione
      await refreshData();
      
      toast.success('Dati importati con successo');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Errore durante l\'importazione dei dati');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Qui dovrebbe essere implementata la logica di esportazione
      toast.success('Dati esportati con successo');
    } catch (error) {
      toast.error('Errore durante l\'esportazione dei dati');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
            <p className="text-gray-600 dark:text-gray-400">Configura le tue preferenze</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Preferenze
              </CardTitle>
              <CardDescription>Personalizza l'esperienza dell'app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Chiaro</SelectItem>
                    <SelectItem value="dark">Scuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Lingua</Label>
                <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">Valuta</Label>
                <Select value={preferences.currency} onValueChange={(value) => setPreferences({...preferences, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="USD">Dollaro ($)</SelectItem>
                    <SelectItem value="GBP">Sterlina (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notifiche</Label>
                <Switch
                  id="notifications"
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup">Backup automatico</Label>
                <Switch
                  id="autoBackup"
                  checked={preferences.autoBackup}
                  onCheckedChange={(checked) => setPreferences({...preferences, autoBackup: checked})}
                />
              </div>

              <Button onClick={handleSavePreferences} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salva Preferenze
              </Button>
            </CardContent>
          </Card>

          {/* Data Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>Gestione Dati</CardTitle>
              <CardDescription>Importa, esporta e gestisci i tuoi dati</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="import">Importa Dati</Label>
                <Input
                  id="import"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                />
                {isImporting && <p className="text-sm text-gray-500">Importazione in corso...</p>}
              </div>

              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Esporta Dati
              </Button>

              <Button onClick={signOut} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
