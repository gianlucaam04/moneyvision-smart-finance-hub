import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Bell,
  Lock,
  Upload,
  Download,
  Trash2,
  FileText,
  HelpCircle,
  ShieldAlert,
  Sun,
  Shield,
  Smartphone,
  Database
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user, updateUserPreferences, deleteAccount: deleteUserAccount, exportData, importData, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  
  // State per dialoghi
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  
  // State per il cambio password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // State per l'importazione file
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Preleviamo i valori dalle preferenze utente
  const [darkMode, setDarkMode] = useState(user?.preferences.theme === 'dark');
  const [notifications, setNotifications] = useState(user?.preferences.notifications || false);
  const [biometricAuth, setBiometricAuth] = useState(user?.preferences.biometricAuth || false);
  const [currency, setCurrency] = useState(user?.preferences.currency || 'EUR');
  const [language, setLanguage] = useState(user?.preferences.language || 'it');
  
  // Aggiorniamo gli stati locali quando l'utente cambia
  useEffect(() => {
    if (user) {
      setDarkMode(user.preferences.theme === 'dark');
      setNotifications(user.preferences.notifications);
      setBiometricAuth(user.preferences.biometricAuth);
      setCurrency(user.preferences.currency);
      setLanguage(user.preferences.language);
      
      // Applica tema in base alle preferenze utente
      document.documentElement.classList.toggle('dark', 
        user.preferences.theme === 'dark' || 
        (user.preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }
  }, [user]);
  
  // Gestori degli eventi per le preferenze
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    updateUserPreferences({ theme: newDarkMode ? 'dark' : 'light' });
    toast({
      title: newDarkMode ? "🌙 Tema scuro attivato" : "☀️ Tema chiaro attivato",
      description: "Le preferenze sono state salvate.",
    });
  };
  
  const handleNotificationsToggle = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    updateUserPreferences({ notifications: newNotifications });
    toast({
      title: newNotifications ? "🔔 Notifiche attivate" : "🔕 Notifiche disattivate",
      description: "Le preferenze sono state salvate.",
    });
  };
  
  const handleBiometricToggle = () => {
    const newBiometricAuth = !biometricAuth;
    setBiometricAuth(newBiometricAuth);
    updateUserPreferences({ biometricAuth: newBiometricAuth });
    toast({
      title: newBiometricAuth ? "🔒 Autenticazione biometrica abilitata" : "🔓 Autenticazione biometrica disabilitata",
      description: newBiometricAuth ? "Ora puoi usare l'impronta digitale per accedere." : "Ora userai solo password.",
    });
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    updateUserPreferences({ language: value });
    toast({
      title: "🌍 Lingua aggiornata",
      description: "Le preferenze sono state salvate.",
    });
  };
  
  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    updateUserPreferences({ currency: value });
    toast({
      title: "💰 Valuta aggiornata",
      description: "Le preferenze sono state salvate.",
    });
  };
  
  // Gestione password
  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Le password non corrispondono");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("La password deve essere di almeno 6 caratteri");
      return;
    }
    
    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setShowPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      toast({
        title: "🔒 Password aggiornata",
        description: "La tua password è stata cambiata con successo.",
      });
    } else {
      setPasswordError("Password attuale non corretta");
    }
  };
  
  // Gestione dati
  const handleExportData = async () => {
    const success = await exportData();
    if (success) {
      toast({
        title: "📊 Esportazione completata",
        description: "I tuoi dati sono stati scaricati.",
      });
    } else {
      toast({
        title: "❌ Errore di esportazione",
        description: "Non è stato possibile esportare i dati.",
        variant: "destructive",
      });
    }
  };
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const success = await importData(content);
        if (success) {
          toast({
            title: "📥 Importazione completata",
            description: "I dati sono stati importati con successo.",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Errore di importazione",
          description: "Il file selezionato non è valido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset input per consentire la selezione dello stesso file
    if (event.target) {
      event.target.value = '';
    }
  };
  
  // Gestione eliminazione account
  const handleConfirmDelete = async () => {
    const success = await deleteUserAccount();
    if (success) {
      setShowDeleteDialog(false);
      toast({
        title: "⚠️ Account eliminato",
        description: "Il tuo account è stato eliminato definitivamente.",
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <Navigation />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                Impostazioni
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Personalizza la tua esperienza MoneyVision
              </p>
            </div>

            <Tabs defaultValue="app" className="space-y-6">
              <TabsList>
                <TabsTrigger value="app">Gestione App</TabsTrigger>
                <TabsTrigger value="account">Account & Dati</TabsTrigger>
              </TabsList>
              <TabsContent value="app" className="space-y-6">
                {/* Preferenze App */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Preferenze Applicazione
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <div>
                          <Label>Tema Scuro</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Attiva il tema scuro per ridurre l'affaticamento degli occhi
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={darkMode} 
                        onCheckedChange={handleDarkModeToggle}
                      />
                    </div>

                    <Separator/>
                  </CardContent>
                </Card>

                {/* Notifiche */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifiche
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifiche Push</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Ricevi notifiche per transazioni e obiettivi
                        </p>
                      </div>
                      <Switch 
                        checked={notifications} 
                        onCheckedChange={handleNotificationsToggle}
                      />
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>
              <TabsContent value="account" className="space-y-6">
                {/* Sicurezza */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Sicurezza
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5" />
                        <div>
                          <Label>Autenticazione Biometrica</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Usa impronta digitale o Face ID per accedere
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={biometricAuth} 
                        onCheckedChange={handleBiometricToggle}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Cambia Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Gestione Dati */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Gestione Dati
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={handleExportData}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Esporta Dati
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={handleImportClick}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Importa Dati
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                      />
                    </div>

                    <Separator />

                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Zona Pericolosa
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        L'eliminazione dell'account è permanente e non può essere annullata.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteDialog(true)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Elimina Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Info App */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Informazioni App</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Versione</Label>
                        <p className="text-gray-600 dark:text-gray-300">1.0.0</p>
                      </div>
                      <div>
                        <Label>Ultimo Aggiornamento</Label>
                        <p className="text-gray-600 dark:text-gray-300">15 Gen 2025</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setShowTermsDialog(true)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Termini di Servizio
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setShowPrivacyDialog(true)}
                      >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Privacy Policy
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setShowSupportDialog(true)}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Supporto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50 overflow-hidden">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
      
      {/* Dialogo Cambio Password */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambia Password</DialogTitle>
            <DialogDescription>
              Inserisci la tua password attuale e la nuova password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Password Attuale</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nuova Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Conferma Nuova Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Annulla</Button>
            <Button onClick={handlePasswordSubmit}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogo Eliminazione Account */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare l'account?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Elimina Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialogo Termini di Servizio */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Termini di Servizio</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto pr-6">
            <h3 className="text-lg font-semibold mb-2">1. Accettazione dei Termini</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Utilizzando l'applicazione MoneyVision, accetti i presenti termini di servizio. Se non accetti i termini, non utilizzare l'applicazione.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">2. Descrizione del Servizio</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoneyVision è un'app di gestione finanziaria personale che ti aiuta a monitorare entrate, uscite, budget e obiettivi di risparmio.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">3. Account Utente</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Per utilizzare alcune funzionalità dell'app, potresti dover creare un account. Sei responsabile di mantenere la sicurezza delle tue credenziali di accesso.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">4. Privacy</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              La nostra politica sulla privacy descrive la raccolta e l'utilizzo dei tuoi dati personali. Utilizzando MoneyVision accetti le pratiche descritte nella nostra Privacy Policy.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">5. Modifiche ai Termini</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno effettive immediatamente dopo la pubblicazione dei termini aggiornati.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTermsDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogo Privacy Policy */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto pr-6">
            <h3 className="text-lg font-semibold mb-2">1. Raccolta dei Dati</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoneyVision raccoglie i dati forniti direttamente dall'utente durante la registrazione e l'utilizzo dell'app, inclusi dati personali e finanziari.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">2. Utilizzo dei Dati</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              I tuoi dati vengono utilizzati per fornire e migliorare i servizi di MoneyVision, personalizzare l'esperienza utente e inviare comunicazioni importanti relative al servizio.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">3. Protezione dei Dati</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              La sicurezza dei tuoi dati è importante per noi. Adottiamo misure tecniche e organizzative per proteggere i tuoi dati personali da accessi non autorizzati.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">4. Condivisione dei Dati</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Non vendiamo i tuoi dati personali a terze parti. I dati potrebbero essere condivisi con fornitori di servizi che ci assistono nella gestione dell'app.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">5. I Tuoi Diritti</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Hai il diritto di accedere, correggere o eliminare i tuoi dati personali. Puoi esercitare questi diritti contattando il nostro supporto clienti.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPrivacyDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogo Supporto */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Centro Assistenza</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Contattaci</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Per qualsiasi problema o domanda, contattaci a:
              </p>
              <p className="font-medium">supporto@moneyvision.app</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Domande Frequenti</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Come posso esportare i miei dati?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vai su Impostazioni {">"}  Gestione Dati e clicca su "Esporta Dati".
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Come posso cambiare la valuta predefinita?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vai su Impostazioni {">"} Preferenze Applicazione e seleziona la valuta desiderata.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">La mia applicazione non si sincronizza correttamente</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prova a disconnettere e riconnettere il tuo account, o a riavviare l'applicazione.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSupportDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
