
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Archive, Calendar, TrendingDown, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import HistoricalCharts from '@/components/Historical/HistoricalCharts';
import HistoricalSummary from '@/components/Historical/HistoricalSummary';
import { archivesService, type ArchiveSummary, type ArchiveData } from '@/services/archivesService';

const HistoricalData = () => {
  const [archives, setArchives] = useState<ArchiveSummary[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<string>('');
  const [archiveData, setArchiveData] = useState<ArchiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      const data = await archivesService.getUserArchives();
      setArchives(data);
    } catch (error) {
      toast.error('Errore nel caricamento degli archivi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveSelect = async (archiveId: string) => {
    setSelectedArchive(archiveId);
    setIsLoadingData(true);
    
    try {
      const data = await archivesService.getArchiveData(archiveId);
      setArchiveData(data);
      toast.success('Dati storici caricati con successo');
    } catch (error) {
      toast.error('Errore nel caricamento dei dati storici');
      setArchiveData(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex flex-col lg:flex-row">
          <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-6">
            <Navigation />
          </aside>
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finance-blue mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400">Caricamento dati storici...</p>
              </div>
            </div>
          </main>
        </div>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
          <Navigation />
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-6">
          <Navigation />
        </aside>
        <main className="flex-1 container mx-auto px-4 py-8 space-y-8 pb-24 lg:pb-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-finance-blue/10 rounded-lg">
                <Archive className="w-6 h-6 text-finance-blue" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-finance-blue to-blue-600 bg-clip-text text-transparent">
                  Dati Storici
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Visualizza i tuoi dati finanziari archiviati
                </p>
              </div>
            </div>
          </div>

          {/* Archive Selection */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-finance-blue" />
                Seleziona Periodo Storico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {archives.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nessun dato storico disponibile
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    I dati più vecchi di 3 anni verranno automaticamente archiviati e saranno visibili qui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Select value={selectedArchive} onValueChange={handleArchiveSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona un periodo da visualizzare" />
                    </SelectTrigger>
                    <SelectContent>
                      {archives.map((archive) => (
                        <SelectItem key={archive.id} value={archive.id}>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(archive.dateRangeStart).toLocaleDateString('it-IT')} - {' '}
                              {new Date(archive.dateRangeEnd).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {archives.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {archives.length} {archives.length === 1 ? 'archivio disponibile' : 'archivi disponibili'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Loading */}
          {isLoadingData && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-finance-blue"></div>
                  <span className="text-gray-600 dark:text-gray-400">Caricamento dati storici...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historical Data Display */}
          {archiveData && !isLoadingData && (
            <div className="space-y-6">
              <HistoricalSummary data={archiveData} />
              <HistoricalCharts data={archiveData} />
            </div>
          )}
        </main>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <Navigation />
      </nav>
    </div>
  );
};

export default HistoricalData;
