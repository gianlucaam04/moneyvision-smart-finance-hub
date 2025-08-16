import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
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
import { Progress } from '@/components/ui/progress';
import { ensurePushSubscription } from '@/push/subscribePush';

const Settings: React.FC = () => {
  const { user, updateUserPreferences, signOut } = useAuth();
  const { refreshData } = useFinance();
  const { setTheme } = useTheme();
  const [isImporting, setIsImporting] = useState(false);
  const [importTotal, setImportTotal] = useState(0);
  const [importDone, setImportDone] = useState(0);
  const [importStatus, setImportStatus] = useState<string>('');
  const [skippedTx, setSkippedTx] = useState(0);
  const [skippedCat, setSkippedCat] = useState(0);
  const [skippedGoal, setSkippedGoal] = useState(0);
  const [recentNotes, setRecentNotes] = useState<string[]>([]);

  const pushNote = (msg: string) => {
    setRecentNotes(prev => {
      const next = [msg, ...prev];
      return next.slice(0, 5);
    });
  };
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
          // prova a registrare la push subscription
          if (user?.id) {
            const ok = await ensurePushSubscription(user.id);
            if (!ok) {
              toast.message('Notifiche push non completamente configurate', {
                description: 'Verifica che il browser supporti le push e che i permessi siano attivi.'
              });
            }
          }
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
        // se già granted, assicura la push subscription
        if (user?.id) {
          const ok = await ensurePushSubscription(user.id);
          if (!ok) {
            toast.message('Notifiche push non completamente configurate', {
              description: 'Verifica che il browser supporti le push e che i permessi siano attivi.'
            });
          }
        }
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
      } catch (error) {
        toast.error('Errore nell\'abilitare il backup automatico');
        setPreferences({ ...preferences, autoBackup: false });
        return;
      }
    } else {
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

      // Helper: valida UUID v4
      const isValidUUID = (value: unknown): value is string =>
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

      // Raggruppa e archivia transazioni oltre 3 anni
      if (data.transactions && Array.isArray(data.transactions)) {
        const now = new Date();
        const threshold = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        const historical = data.transactions.filter(tx => new Date(tx.date) < threshold);
        const recent = data.transactions.filter(tx => new Date(tx.date) >= threshold);

        // Calcola il totale degli step di import
        const totalSteps = (historical.length > 0 ? 1 : 0)
          + recent.length
          + (Array.isArray(data.categories) ? data.categories.length : 0)
          + (Array.isArray(data.goals) ? data.goals.length : 0);
        setImportTotal(totalSteps);
        setImportDone(0);
        setImportStatus('Preparazione import...');

        if (historical.length > 0) {
          const dates = historical.map(tx => new Date(tx.date)).sort((a, b) => a.getTime() - b.getTime());
          const dateRangeStart = dates[0].toISOString().split('T')[0];
          const dateRangeEnd = dates[dates.length - 1].toISOString().split('T')[0];
          try {
            await archivesService.createArchive(historical, data.categories || [], dateRangeStart, dateRangeEnd);
            archivedCount = 1;
            setImportDone(prev => prev + 1);
            setImportStatus('Archivio storico creato');
          } catch (archiveError) {
            console.error('Error archiving historical data:', archiveError);
          }
        }

        for (const transaction of recent) {
          setImportStatus(`Import transazione: ${transaction.description || ''}`);
          // 1) Prova match per id se presente
          let existingTransactionId: string | null = null;
          if (isValidUUID(transaction.id)) {
            const { data: byId } = await supabase
              .from('transactions')
              .select('id')
              .eq('id', transaction.id)
              .maybeSingle();
            if (byId?.id) existingTransactionId = byId.id as string;
          }

          // 2) Fallback: match su campi chiave senza user_id
          if (!existingTransactionId) {
            let query = supabase
              .from('transactions')
              .select('id')
              .eq('amount', transaction.amount)
              .eq('description', transaction.description)
              .eq('date', transaction.date);
            if (isValidUUID(transaction.category_id)) {
              query = query.eq('category_id', transaction.category_id as string);
            }
            const { data: byFields } = await query.maybeSingle();
            if (byFields?.id) existingTransactionId = byFields.id as string;
          }

          if (!existingTransactionId) {
            // Inserisci solo se non esiste
            const { error } = await supabase
              .from('transactions')
              .insert({
                ...transaction,
                user_id: user.id,
                id: undefined
              });
            if (!error) importedCount++;
          } else {
            setSkippedTx(prev => prev + 1);
            pushNote(`Transazione duplicata: ${transaction.description || ''} (${transaction.date})`);
          }
          setImportDone(prev => prev + 1);
        }
      }

      // Importa categorie (evita duplicati)
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          setImportStatus(`Import categoria: ${category.name}`);
          // 1) Prova match per id se presente, altrimenti per name
          let existingCategoryId: string | null = null;
          if (isValidUUID(category.id)) {
            const { data: byId } = await supabase
              .from('categories')
              .select('id')
              .eq('id', category.id)
              .maybeSingle();
            if (byId?.id) existingCategoryId = byId.id as string;
          }
          if (!existingCategoryId) {
            const { data: byName } = await supabase
              .from('categories')
              .select('id')
              .eq('name', category.name)
              .maybeSingle();
            if (byName?.id) existingCategoryId = byName.id as string;
          }

          if (!existingCategoryId) {
            // Inserisci solo se non esiste
            await supabase
              .from('categories')
              .insert({
                ...category,
                user_id: user.id,
                id: undefined
              });
          } else {
            setSkippedCat(prev => prev + 1);
            pushNote(`Categoria duplicata: ${category.name}`);
          }
          setImportDone(prev => prev + 1);
        }
      }

      // Importa obiettivi (evita duplicati)
      if (data.goals && Array.isArray(data.goals)) {
        for (const goal of data.goals) {
          setImportStatus(`Import obiettivo: ${goal.title}`);
          // 1) Prova match per id se presente, altrimenti per title + target_amount
          let existingGoalId: string | null = null;
          if (isValidUUID(goal.id)) {
            const { data: byId } = await supabase
              .from('savings_goals')
              .select('id')
              .eq('id', goal.id)
              .maybeSingle();
            if (byId?.id) existingGoalId = byId.id as string;
          }
          if (!existingGoalId) {
            const { data: byFields } = await supabase
              .from('savings_goals')
              .select('id')
              .eq('title', goal.title)
              .eq('target_amount', goal.target_amount)
              .maybeSingle();
            if (byFields?.id) existingGoalId = byFields.id as string;
          }

          if (!existingGoalId) {
            // Inserisci solo se non esiste
            const { data: insertedGoalData, error: goalError } = await supabase
              .from('savings_goals')
              .insert({
                title: goal.title,
                description: goal.description ?? null,
                target_amount: goal.target_amount,
                current_amount: goal.current_amount,
                deadline: goal.deadline,
                color: goal.color,
                is_completed: goal.is_completed,
                user_id: user.id
              });
            if (goalError) {
              console.error('Errore import obiettivi:', goalError);
              toast.error(`Errore import goal: ${goalError.message}`);
            }
          } else {
            setSkippedGoal(prev => prev + 1);
            pushNote(`Obiettivo duplicato: ${goal.title}`);
          }
          setImportDone(prev => prev + 1);
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
      setImportStatus('');
      setImportTotal(0);
      setImportDone(0);
      setSkippedTx(0);
      setSkippedCat(0);
      setSkippedGoal(0);
      setRecentNotes([]);
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
        {isImporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Importazione in corso</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{importStatus || 'Elaborazione dati...'}</p>
              <Progress value={importTotal > 0 ? Math.round((importDone / Math.max(importTotal, 1)) * 100) : 10} />
              <div className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
                {importDone}/{importTotal} completati
              </div>
              {(skippedTx + skippedCat + skippedGoal) > 0 && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                  <div className="mb-1 font-medium">Elementi già presenti (saltati):</div>
                  <div className="mb-1 flex gap-3">
                    <span>Transazioni: {skippedTx}</span>
                    <span>Categorie: {skippedCat}</span>
                    <span>Obiettivi: {skippedGoal}</span>
                  </div>
                  {recentNotes.length > 0 && (
                    <ul className="mt-1 list-disc pl-5">
                      {recentNotes.map((n, i) => (
                        <li key={i} className="truncate">{n}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">Per favore non chiudere la pagina o eseguire altre azioni fino al completamento.</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between"></div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Preferenze Utente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-primary" />
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
                <Palette className="w-5 h-5 text-brand-secondary" />
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
                  onValueChange={(value) => {
                    setPreferences({...preferences, theme: value});
                    setTheme(value);
                  }}
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
                  onValueChange={(value) => {
                    setPreferences({...preferences, language: value});
                    if (typeof document !== 'undefined') {
                      document.documentElement.lang = value as string;
                    }
                  }}
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
                <Database className="w-5 h-5 text-brand-accent" />
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
                      I dati più vecchi di 3 anni saranno archiviati automaticamente
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
                      <p className="text-sm text-brand-primary mt-2">
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
