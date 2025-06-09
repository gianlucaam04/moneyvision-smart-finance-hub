
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Settings as SettingsIcon, Download, Upload, Trash2, Save, Database } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { archivesService } from '@/services/archivesService';

const Settings: React.FC = () => {
  const { user, updateUserPreferences, signOut } = useAuth();
  const { refreshData, transactions, categories } = useFinance();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

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
    try {
      const success = await updateUserPreferences(preferences);
      if (success) {
        toast.success('Preferenze salvate con successo');
      } else {
        toast.error('Errore nel salvataggio delle preferenze');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Errore nel salvataggio delle preferenze');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      console.log('Importing data:', data);

      if (!user) {
        toast.error('Utente non autenticato');
        return;
      }

      // Importa transazioni se presenti
      if (data.transactions && Array.isArray(data.transactions)) {
        for (const transaction of data.transactions) {
          const transactionDate = new Date(transaction.date);
          const now = new Date();
          const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

          // Se la transazione è più vecchia di 5 anni, archiviala
          if (transactionDate < fiveYearsAgo) {
            console.log('Transaction older than 5 years, archiving...');
            // Raggruppa per anno per l'archiviazione
            const year = transactionDate.getFullYear();
            const yearStart = `${year}-01-01`;
            const yearEnd = `${year}-12-31`;
            
            try {
              await archivesService.createArchive(
                [transaction],
                [],
                yearStart,
                yearEnd
              );
            } catch (archiveError) {
              console.error('Error archiving old transaction:', archiveError);
            }
          } else {
            // Importa normalmente le transazioni recenti
            const { error } = await supabase
              .from('transactions')
              .insert({
                ...transaction,
                user_id: user.id,
                id: undefined // Lascia che il DB generi un nuovo ID
              });
            
            if (error) {
              console.error('Error importing transaction:', error);
            }
          }
        }
      }

      // Importa categorie se presenti
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          const { error } = await supabase
            .from('categories')
            .insert({
              ...category,
              user_id: user.id,
              id: undefined // Lascia che il DB generi un nuovo ID
            });
          
          if (error) {
            console.error('Error importing category:', error);
          }
        }
      }

      // Refresh dei dati dopo l'importazione
      await refreshData();
      
      toast.success('Dati importati con successo. I dati più vecchi di 5 anni sono stati archiviati automaticamente.');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Errore durante l\'importazione dei dati');
    } finally {
      setIsImporting(false);
      // Reset input file
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExportData = async () => {
    if (!user) {
      toast.error('Utente non autenticato');
      return;
    }

    setIsExporting(true);
    try {
      // Esporta tutti i dati dell'utente
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) throw transactionsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (categoriesError) throw categoriesError;

      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      const exportData = {
        transactions: transactionsData || [],
        categories: categoriesData || [],
        goals: goalsData || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Crea e scarica il file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `moneyvision-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dati esportati con successo');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Errore durante l\'esportazione dei dati');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = async () => {
    if (!user) {
      toast.error('Utente non autenticato');
      return;
    }

    setIsClearingData(true);
    try {
      // Elimina tutti i dati dell'utente (ma non l'utente stesso)
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (transactionsError) throw transactionsError;

      const { error: categoriesError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id);

      if (categoriesError) throw categoriesError;

      const { error: goalsError } = await supabase
        .from('savings_goals')
        .delete()
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      const { error: archivesError } = await supabase
        .from('archives')
        .delete()
        .eq('user_id', user.id);

      if (archivesError) throw archivesError;

      // Refresh dei dati
      await refreshData();
      
      toast.success('Tutti i dati sono stati eliminati con successo');
      setShowClearDialog(false);
    } catch (error) {
      console.error('Clear data error:', error);
      toast.error('Errore durante l\'eliminazione dei dati');
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
            <p className="text-gray-600 dark:text-gray-400">Configura le tue preferenze</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Preferences Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Preferenze
              </CardTitle>
              <CardDescription>Personalizza l'esperienza dell'app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Chiaro</SelectItem>
                    <SelectItem value="dark">Scuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Lingua</Label>
                <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Valuta</Label>
                <Select value={preferences.currency} onValueChange={(value) => setPreferences({...preferences, currency: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="USD">Dollaro ($)</SelectItem>
                    <SelectItem value="GBP">Sterlina (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label htmlFor="notifications">Notifiche</Label>
                <Switch
                  id="notifications"
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between py-2">
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
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Gestione Dati</CardTitle>
              <CardDescription>Importa, esporta e gestisci i tuoi dati</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import">Importa Dati</Label>
                <Input
                  id="import"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="w-full"
                />
                {isImporting && <p className="text-sm text-gray-500">Importazione in corso...</p>}
                <p className="text-xs text-gray-500">
                  I dati più vecchi di 5 anni verranno automaticamente archiviati
                </p>
              </div>

              <Button 
                onClick={handleExportData} 
                variant="outline" 
                className="w-full"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Esportazione...' : 'Esporta Dati'}
              </Button>

              <Button 
                onClick={() => setShowClearDialog(true)} 
                variant="destructive" 
                className="w-full"
                disabled={isClearingData}
              >
                <Database className="w-4 h-4 mr-2" />
                Elimina Tutti i Dati
              </Button>

              <div className="pt-4 border-t">
                <Button onClick={signOut} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog per conferma eliminazione dati */}
        <ConfirmDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          title="Elimina tutti i dati"
          description="Sei sicuro di voler eliminare tutti i tuoi dati? Questa azione non può essere annullata. Il tuo account utente rimarrà attivo."
          onConfirm={handleClearAllData}
          confirmLabel="Elimina tutto"
          cancelLabel="Annulla"
        />
      </div>
    </Layout>
  );
};

export default Settings;
