
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Local Json type compatible with Supabase JSON columns
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ArchiveSummary = {
  id: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  createdAt?: string;
};

// Payload stored in archives.file_data (must be JSON-serializable)
type ArchivePayload = {
  transactions: Json[];
  categories: Json[];
};

// Returned data shape for consumers
export type ArchiveData = {
  transactions: unknown[];
  categories: unknown[];
};

export const archivesService = {
  // Fetch archive summaries for current user (used by HistoricalData)
  async getUserArchives(): Promise<ArchiveSummary[]> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Utente non autenticato');

    const { data, error } = await supabase
      .from('archives')
      .select('id, date_range_start, date_range_end, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: {
      id: string;
      date_range_start: string;
      date_range_end: string;
      created_at?: string;
    }) => ({
      id: row.id,
      dateRangeStart: row.date_range_start,
      dateRangeEnd: row.date_range_end,
      createdAt: row.created_at,
    }));
  },

  // Fetch full archive payload by id (used by HistoricalData)
  async getArchiveData(archiveId: string): Promise<ArchiveData> {
    const { data, error } = await supabase
      .from('archives')
      .select('file_data')
      .eq('id', archiveId)
      .single();

    if (error) throw error;

    const payload = (data as { file_data?: ArchivePayload })?.file_data;
    const transactions = Array.isArray(payload?.transactions) ? payload!.transactions : [];
    const categories = Array.isArray(payload?.categories) ? payload!.categories : [];
    return {
      transactions,
      categories,
    };
  },

  // Create a new archive row with provided data (used by Settings import)
  async createArchive(
    transactions: unknown[],
    categories: unknown[],
    dateRangeStart: string,
    dateRangeEnd: string
  ): Promise<string> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Utente non autenticato');

    const payload: ArchivePayload = {
      transactions: (transactions as unknown[] as Json[]),
      categories: (categories as unknown[] as Json[]),
    };

    // Check if an archive for the same date range already exists for this user
    const fileName = `archive_${dateRangeStart}_${dateRangeEnd}`;
    const { data: existing } = await supabase
      .from('archives')
      .select('id')
      .eq('user_id', userId)
      .eq('archive_type', 'import_archive')
      .eq('date_range_start', dateRangeStart)
      .eq('date_range_end', dateRangeEnd)
      .maybeSingle();

    if (existing?.id) {
      return existing.id as string;
    }

    const { data, error } = await supabase
      .from('archives')
      .insert({
        user_id: userId,
        archive_type: 'import_archive',
        file_data: payload as unknown as Json,
        file_name: fileName,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd,
      })
      .select('id')
      .single();

    if (error) throw error;
    return (data as { id: string }).id;
  },

  async getArchivedData(userId: string, type: 'transactions' | 'goals' | 'all' = 'all') {
    try {
      const query = supabase
        .from('archives')
        .select('*')
        .eq('user_id', userId);

      if (type !== 'all') {
        query.eq('archive_type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching archived data:', error);
      throw error;
    }
  },

  async archiveData(userId: string, data: unknown, type: 'transactions' | 'goals') {
    try {
      const { error } = await supabase
        .from('archives')
        .insert({
          user_id: userId,
          archive_type: type,
          file_data: data as unknown as Json,
          file_name: `${type}_archive_${new Date().toISOString()}`,
          date_range_start: new Date().toISOString(),
          date_range_end: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error archiving data:', error);
      throw error;
    }
  },

  async deleteArchivedData(archiveId: string) {
    try {
      const { error } = await supabase
        .from('archives')
        .delete()
        .eq('id', archiveId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting archived data:', error);
      throw error;
    }
  }
};

export const exportToExcel = async (data: Record<string, unknown>[], filename: string) => {
  try {
    const JSZip = (await import('jszip')).default;
    
    // Create CSV content directly from data
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value !== null && value !== undefined 
            ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
            : '';
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create ZIP file
    const zip = new JSZip();
    zip.file(`${filename}.csv`, csvContent);
    
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download file
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
