
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Settings as SettingsIcon, Download, Upload, Trash2, Save, Database, User, Palette, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { archivesService } from '@/services/archivesService';

const Settings: React.FC = () => {
  const { user, updateUserPreferences, signOut } = useAuth();
  const { refreshData } = useFinance();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const defaultPreferences = {
    theme: 'light',
    language: 'it',
    currency: 'EUR',
    notifications: true,
    autoBackup: false
  };

  const [preferences, setPreferences] = useState(user?.preferences || defaultPreferences);

  // Effetto per sincronizzare le preferenze quando cambiano
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user?.preferences]);

  // Funzione per gestire le notifiche
  const handleNotificationsToggle = async (enabled: boolean) => {
    const newPreferences = { ...preferences, notifications: enabled };
    setPreferences(newPreferences);

    if (enabled) {
      // Richiedi permessi di notifica se abilitato
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success('Notifiche abilitate! Riceverai promemoria per le tue finanze.');
          new Notification('MoneyVision', {
            body: 'Notifiche abilitate con successo!',
            icon: '/favicon.ico'
          });
        } else {
          toast.error('Permessi di notifica negati. Abilitali dalle impostazioni del browser.');
          setPreferences({ ...preferences, notifications: false });
          return;
        }
      } else if ('Notification' in window && Notification.permission === 'granted') {
        toast.success('Notifiche abilitate!');
        new Notification('MoneyVision', {
          body: 'Notifiche abilitate con successo!',
          icon: '/favicon.ico'
        });
      }
    } else {
      toast.info('Notifiche disabilitate.');
    }

    // Salva le preferenze
    try {
      await updateUserPreferences(newPreferences);
    } catch (error) {
      console.error('Errore nel salvare le preferenze notifiche:', error);
      setPreferences(preferences); // Rollback
    }
  };

  // Funzione per gestire il backup automatico
  const handleAutoBackupToggle = async (enabled: boolean) => {
    const newPreferences = { ...preferences, autoBackup: enabled };
    setPreferences(newPreferences);

    if (enabled) {
      // Esegui un backup immediato per testare
      try {
        await handleExportData();
        toast.success('Backup automatico abilitato! Verrà eseguito settimanalmente.');
        
        // Imposta un intervallo per backup automatici (esempio: ogni settimana)
        const backupInterval = setInterval(async () => {
          if (preferences.autoBackup) {
            await handleExportData();
            console.log('Backup automatico eseguito');
          }
        }, 7 * 24 * 60 * 60 * 1000); // 1 settimana
        
        // Salva l'ID dell'intervallo nelle preferenze (in un'app reale useresti un job scheduler)
        localStorage.setItem('backupInterval', backupInterval.toString());
      } catch (error) {
        toast.error('Errore nell\'abilitare il backup automatico');
        setPreferences({ ...preferences, autoBackup: false });
        return;
      }
    } else {
      // Disabilita il backup automatico
      const intervalId = localStorage.getItem('backupInterval');
      if (intervalId) {
        clearInterval(parseInt(intervalId));
        localStorage.removeItem('backupInterval');
      }
      toast.info('Backup automatico disabilitato.');
    }

    // Salva le preferenze
    try {
      await updateUserPreferences(newPreferences);
    } catch (error) {
      console.error('Errore nel salvare le preferenze backup:', error);
      setPreferences(preferences); // Rollback
    }
  };

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
      
      if (!user) {
        toast.error('Utente non autenticato');
        return;
      }

      let importedCount = 0;
      let archivedCount = 0;

      // Importa transazioni
      if (data.transactions && Array.isArray(data.transactions)) {
        for (const transaction of data.transactions) {
          const transactionDate = new Date(transaction.date);
          const now = new Date();
          const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

          if (transactionDate < fiveYearsAgo) {
            // Archivia transazioni più vecchie di 5 anni
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
              archivedCount++;
            } catch (archiveError) {
              console.error('Error archiving old transaction:', archiveError);
            }
          } else {
            // Importa transazioni recenti
            const { error } = await supabase
              .from('transactions')
              .insert({
                ...transaction,
                user_id: user.id,
                id: undefined
              });
            
            if (!error) {
              importedCount++;
            }
          }
        }
      }

      // Importa categorie
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          await supabase
            .from('categories')
            .insert({
              ...category,
              user_id: user.id,
              id: undefined
            });
        }
      }

      // Importa obiettivi
      if (data.goals && Array.isArray(data.goals)) {
        for (const goal of data.goals) {
          await supabase
            .from('savings_goals')
            .insert({
              title: goal.title,
              description: goal.description,
              target_amount: goal.targetAmount,
              current_amount: goal.currentAmount,
              deadline: goal.deadline,
              color: goal.color,
              is_completed: goal.isCompleted,
              user_id: user.id
            });
        }
      }

      await refreshData();
      
      toast.success(
        `Importazione completata! ${importedCount} elementi importati, ${archivedCount} elementi archiviati.`
      );
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Errore durante l\'importazione dei dati');
    } finally {
      setIsImporting(false);
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
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      const { data: goalsData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        transactions: transactionsData || [],
        categories: categoriesData || [],
        goals: goalsData || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

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
      // Elimina tutti i dati dell'utente
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('categories').delete().eq('user_id', user.id),
        supabase.from('savings_goals').delete().eq('user_id', user.id),
        supabase.from('archives').delete().eq('user_id', user.id)
      ]);

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
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Impostazioni
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configura le tue preferenze e gestisci i tuoi dati
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Preferenze Utente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profilo Utente
              </CardTitle>
              <CardDescription>
                Informazioni del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Data di registrazione</Label>
                <Input 
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : ''} 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferenze App */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Preferenze App
              </CardTitle>
              <CardDescription>
                Personalizza l'esperienza dell'app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select 
                  value={preferences.theme} 
                  onValueChange={(value) => setPreferences({...preferences, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">🌞 Chiaro</SelectItem>
                    <SelectItem value="dark">🌙 Scuro</SelectItem>
                    <SelectItem value="system">💻 Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Lingua</Label>
                <Select 
                  value={preferences.language} 
                  onValueChange={(value) => setPreferences({...preferences, language: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Valuta</Label>
                <Select 
                  value={preferences.currency} 
                  onValueChange={(value) => setPreferences({...preferences, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">€ Euro</SelectItem>
                    <SelectItem value="USD">$ Dollaro</SelectItem>
                    <SelectItem value="GBP">£ Sterlina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-yellow-600" />
                    <div>
                      <Label htmlFor="notifications">Notifiche</Label>
                      <p className="text-xs text-gray-500">Ricevi promemoria e aggiornamenti</p>
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={preferences.notifications}
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <div>
                      <Label htmlFor="autoBackup">Backup automatico</Label>
                      <p className="text-xs text-gray-500">Backup settimanale dei tuoi dati</p>
                    </div>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={preferences.autoBackup}
                    onCheckedChange={handleAutoBackupToggle}
                  />
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salva Preferenze
              </Button>
            </CardContent>
          </Card>

          {/* Gestione Dati */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Gestione Dati
              </CardTitle>
              <CardDescription>
                Importa, esporta e gestisci i tuoi dati finanziari
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import" className="text-sm font-medium">
                      📤 Importa Dati
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      I dati più vecchi di 5 anni saranno archiviati automaticamente
                    </p>
                    <Input
                      id="import"
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      disabled={isImporting}
                      className="mt-2"
                    />
                    {isImporting && (
                      <p className="text-sm text-blue-600 mt-2">
                        ⏳ Importazione in corso...
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={handleExportData} 
                    variant="outline" 
                    className="w-full"
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Esportazione...' : '📥 Esporta Dati'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
                      ⚠️ Zona Pericolosa
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Queste azioni sono irreversibili
                    </p>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={() => setShowClearDialog(true)} 
                        variant="destructive" 
                        className="w-full"
                        disabled={isClearingData}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        🗑️ Elimina Tutti i Dati
                      </Button>
                      
                      <Button 
                        onClick={signOut} 
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        🚪 Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ConfirmDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          title="⚠️ Elimina tutti i dati"
          description="Sei sicuro di voler eliminare tutti i tuoi dati? Questa azione non può essere annullata. Il tuo account rimarrà attivo ma tutti i dati finanziari saranno persi."
          onConfirm={handleClearAllData}
          confirmLabel="Elimina tutto"
          cancelLabel="Annulla"
        />
      </div>
    </Layout>
  );
};

export default Settings;
