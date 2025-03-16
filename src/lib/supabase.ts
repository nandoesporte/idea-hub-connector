
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = 'https://otzytxkynqcywtqgpgmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90enl0eGt5bnFjeXd0cWdwZ21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2OTY5MDcsImV4cCI6MjA1NzI3MjkwN30.BUpL4mIlWHZF40mXPt754oPS8Lbmqt29DA64PaanDNI';

// For debugging purposes - log connection info but not keys
console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create the Supabase client with detailed logging
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    // Enhanced logging for debugging
    fetch: (url, options) => {
      const method = options?.method || 'GET';
      const truncatedUrl = typeof url === 'string' 
        ? (url.length > 100 ? url.substring(0, 100) + '...' : url)
        : 'non-string-url';
        
      console.log(`Supabase ${method} request to: ${truncatedUrl}`);
      
      return fetch(url, options)
        .then((response) => {
          console.log(`Supabase response: ${response.status} ${response.statusText}`);
          return response;
        })
        .catch((error) => {
          console.error(`Supabase ${method} request failed:`, error);
          throw error;
        });
    }
  }
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});
