
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const archivesService = {
  async getArchivedData(userId: string, type: 'transactions' | 'goals' | 'all' = 'all') {
    try {
      const { data, error } = await supabase
        .from('archives')
        .select('*')
        .eq('user_id', userId)
        .eq('archive_type', type === 'all' ? undefined : type);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching archived data:', error);
      throw error;
    }
  },

  async archiveData(userId: string, data: any, type: 'transactions' | 'goals') {
    try {
      const { error } = await supabase
        .from('archives')
        .insert({
          user_id: userId,
          archive_type: type,
          file_data: data,
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

export const exportToExcel = async (data: any[], filename: string) => {
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
