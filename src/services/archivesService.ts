
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import type { Archive } from '@/db/schema';

export interface ArchiveData {
  transactions: any[];
  categories: any[];
  archived_at: string;
  archive_reason: string;
}

export interface ArchiveSummary {
  id: string;
  fileName: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  archiveType: string;
  createdAt: string;
}

export const archivesService = {
  // Recupera tutti gli archivi dell'utente
  async getUserArchives(): Promise<ArchiveSummary[]> {
    const { data, error } = await supabase
      .from('archives')
      .select('*')
      .order('date_range_start', { ascending: false });

    if (error) {
      console.error('Errore nel recupero archivi:', error);
      throw new Error('Impossibile recuperare gli archivi');
    }

    return data.map(archive => ({
      id: archive.id,
      fileName: archive.file_name,
      dateRangeStart: archive.date_range_start,
      dateRangeEnd: archive.date_range_end,
      archiveType: archive.archive_type,
      createdAt: archive.created_at || ''
    }));
  },

  // Recupera e decomprime i dati di un archivio specifico
  async getArchiveData(archiveId: string): Promise<ArchiveData> {
    const { data, error } = await supabase
      .from('archives')
      .select('file_data')
      .eq('id', archiveId)
      .single();

    if (error) {
      console.error('Errore nel recupero dati archivio:', error);
      throw new Error('Impossibile recuperare i dati dell\'archivio');
    }

    // I dati sono già in formato JSON nel database, non serve decomprimere
    return data.file_data as ArchiveData;
  },

  // Crea un nuovo archivio per dati più vecchi di 3 anni
  async createArchive(
    transactions: any[],
    categories: any[],
    dateRangeStart: string,
    dateRangeEnd: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    const archiveData: ArchiveData = {
      transactions,
      categories,
      archived_at: new Date().toISOString(),
      archive_reason: 'automatic_3_year_cleanup'
    };

    const { error } = await supabase
      .from('archives')
      .insert({
        user_id: user.id,
        file_name: `archive_${dateRangeStart}_to_${dateRangeEnd}`,
        file_data: archiveData,
        archive_type: 'auto_archive',
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd
      });

    if (error) {
      console.error('Errore nella creazione archivio:', error);
      throw new Error('Impossibile creare l\'archivio');
    }
  }
};
