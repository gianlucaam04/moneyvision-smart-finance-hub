import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Applies user preferences (theme, language, currency, notifications/backup side-effects)
const PreferencesApplier: React.FC = () => {
  const { user } = useAuth();
  const { setTheme, theme } = useTheme();

  // Apply theme and language
  useEffect(() => {
    const prefs = user?.preferences;
    if (!prefs) return;

    // Theme
    if (prefs.theme && prefs.theme !== theme) {
      setTheme(prefs.theme);
    }

    // Language (for screen readers and browser tools)
    if (prefs.language) {
      document.documentElement.lang = prefs.language;
    }

    // Currency: store for global access (formatting utils can read it)
    if (prefs.currency) {
      localStorage.setItem('preferredCurrency', prefs.currency);
      document.documentElement.setAttribute('data-currency', prefs.currency);
    }

    // Notifications: if enabled and permission is default, request once
    if (prefs.notifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => void 0);
      }
    }

    // Auto-backup: ensure an interval exists only if enabled
    try {
      const key = 'backupInterval';
      const existing = localStorage.getItem(key);
      const enabled = !!prefs.autoBackup;
      if (enabled && !existing) {
        const id = window.setInterval(async () => {
          // Perform a silent local backup
          if (!user) return;
          try {
            const [{ data: transactions }, { data: categories }, { data: goals }] = await Promise.all([
              supabase.from('transactions').select('*').eq('user_id', user.id),
              supabase.from('categories').select('*').eq('user_id', user.id),
              supabase.from('savings_goals').select('*').eq('user_id', user.id),
            ]);
            const backup = {
              transactions: transactions || [],
              categories: categories || [],
              goals: goals || [],
              exportDate: new Date().toISOString(),
              version: '1.0',
            };
            const keyName = `mv_backup_${new Date().toISOString()}`;
            localStorage.setItem(keyName, JSON.stringify(backup));
          } catch (_) {
            // ignore backup errors
          }
        }, 7 * 24 * 60 * 60 * 1000);
        localStorage.setItem(key, String(id));
      } else if (!enabled && existing) {
        window.clearInterval(Number(existing));
        localStorage.removeItem(key);
      }
    } catch (_) {
      // ignore
    }
  }, [user, user?.preferences, setTheme, theme]);

  return null;
};

export default PreferencesApplier;
