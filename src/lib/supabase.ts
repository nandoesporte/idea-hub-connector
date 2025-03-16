
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otzytxkynqcywtqgpgmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90enl0eGt5bnFjeXd0cWdwZ21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2OTY5MDcsImV4cCI6MjA1NzI3MjkwN30.BUpL4mIlWHZF40mXPt754oPS8Lbmqt29DA64PaanDNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-auth-token',
    storage: {
      getItem: (key) => {
        try {
          return JSON.parse(localStorage.getItem(key) || '');
        } catch (error) {
          return null;
        }
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
      },
    },
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  realtime: {
    timeout: 30000,
    params: {
      eventsPerSecond: 10,
    },
  },
});
