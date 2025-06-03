
import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun,
  Brain,
  Smartphone,
  Database,
  CreditCard,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('it');

  const handleExportData = () => {
    toast({
      title: "📊 Esportazione iniziata",
      description: "I tuoi dati verranno scaricati a breve.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "📥 Importazione completata",
      description: "I dati sono stati importati con successo.",
    });
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.');
    if (confirm) {
      toast({
        title: "⚠️ Account eliminato",
        description: "Il tuo account è stato eliminato definitivamente.",
      });
    }
  };

  const handleBiometricToggle = () => {
    setBiometricAuth(!biometricAuth);
    toast({
      title: biometricAuth ? "🔓 Autenticazione biometrica disabilitata" : "🔒 Autenticazione biometrica abilitata",
      description: biometricAuth ? "Ora userai solo password." : "Ora puoi usare l'impronta digitale per accedere.",
    });
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

        <main className="flex-1 p-4 lg:p-6">
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

            {/* AI Smart Suggestions per Settings */}
            <Card className="animate-fade-in border-l-4 border-l-finance-blue">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-finance-blue" />
                  Suggerimenti AI per le Impostazioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-400">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-2xl">🔒</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Attiva l'Autenticazione Biometrica
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Proteggi meglio i tuoi dati finanziari con l'impronta digitale o Face ID.
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="hover:bg-finance-blue hover:text-white"
                        onClick={handleBiometricToggle}
                      >
                        Attiva
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profilo Utente */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profilo Utente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" defaultValue="Mario Rossi" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="mario.rossi@email.com" className="mt-1" />
                  </div>
                </div>
                <Button className="bg-finance-blue hover:bg-finance-blue/90">
                  Aggiorna Profilo
                </Button>
              </CardContent>
            </Card>

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
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valuta</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollaro ($)</SelectItem>
                        <SelectItem value="GBP">Sterlina (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lingua</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5" />
                    <div>
                      <Label>Suggerimenti AI</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Ricevi consigli personalizzati sull'app
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={aiSuggestions} 
                    onCheckedChange={setAiSuggestions}
                  />
                </div>
              </CardContent>
            </Card>

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
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Cambia Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gestisci Metodi di Pagamento
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
                    onClick={handleImportData}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importa Dati
                  </Button>
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
                    onClick={handleDeleteAccount}
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
                  <Button variant="ghost" className="w-full justify-start">
                    Termini di Servizio
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Privacy Policy
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Supporto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
    </div>
  );
};

export default Settings;
