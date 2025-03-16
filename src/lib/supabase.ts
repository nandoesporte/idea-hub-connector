
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = 'https://otzytxkynqcywtqgpgmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90enl0eGt5bnFjeXd0cWdwZ21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2OTY5MDcsImV4cCI6MjA1NzI3MjkwN30.BUpL4mIlWHZF40mXPt754oPS8Lbmqt29DA64PaanDNI';

// For debugging purposes - log connection info but not keys
console.log('Initializing Supabase client with URL:', supabaseUrl);

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
          console.error('Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error setting item in localStorage:', error);
          toast.error('Erro ao salvar dados da sessão. Verifique o armazenamento do navegador.');
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from localStorage:', error);
        }
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
  debug: process.env.NODE_ENV === 'development',
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});
