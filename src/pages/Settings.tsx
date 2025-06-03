
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Shield, 
  Download, 
  Upload, 
  Smartphone,
  Moon,
  Sun,
  Globe,
  CreditCard
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('it');
  const [exportFormat, setExportFormat] = useState('json');

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting data in format:', exportFormat);
  };

  const handleImportData = () => {
    // Mock import functionality
    console.log('Importing data...');
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

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  Impostazioni
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Personalizza la tua esperienza MoneyVision
                </p>
              </div>
            </div>

            {/* Profile Section */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profilo Utente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-finance-blue text-white text-xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user?.name || 'Demo User'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      Account Demo
                    </Badge>
                  </div>
                  <Button variant="outline">
                    Modifica Profilo
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Nome Visualizzato</Label>
                    <Input
                      id="displayName"
                      defaultValue={user?.name || ''}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Aspetto e Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <Label className="text-base font-medium">Modalità Scura</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Attiva il tema scuro per un'esperienza più confortevole
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
                    <Label className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Valuta
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollaro USA ($)</SelectItem>
                        <SelectItem value="GBP">Sterlina (£)</SelectItem>
                        <SelectItem value="CHF">Franco Svizzero (CHF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Lingua
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifiche Push</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Ricevi notifiche per insight finanziari e aggiornamenti
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Insights AI</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Notifiche per consigli e analisi personalizzate
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Promemoria Budget</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Avvisi quando ti avvicini ai limiti di spesa
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sicurezza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <Label className="text-base font-medium">Autenticazione Biometrica</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Usa Face ID o Touch ID per accedere rapidamente
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={biometricAuth}
                    onCheckedChange={setBiometricAuth}
                  />
                </div>

                <Separator />

                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="justify-start">
                    Cambia Password
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Gestisci Sessioni Attive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Gestione Dati
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Formato di Esportazione</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={handleExportData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Esporta Dati
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={handleImportData}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importa Dati
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📊 Archiviazione Automatica
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    I dati più vecchi di 3 anni vengono automaticamente archiviati per ottimizzare le performance.
                    Puoi sempre accedervi dalla sezione archivio.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Azioni Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    Cancella Cache
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    Reset Impostazioni
                  </Button>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Disconnetti
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <Navigation className="flex flex-row justify-around items-center space-y-0 space-x-2" />
      </nav>
    </div>
  );
};

export default Settings;
