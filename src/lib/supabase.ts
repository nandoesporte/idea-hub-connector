
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
        .then(async (response) => {
          console.log(`Supabase response: ${response.status} ${response.statusText}`);
          
          // For error responses, log more details
          if (!response.ok && (response.status >= 400)) {
            try {
              // Clone the response so we can still return the original
              const cloned = response.clone();
              const errorBody = await cloned.text();
              try {
                const errorJson = JSON.parse(errorBody);
                console.error(`Supabase error response details:`, errorJson);
              } catch {
                console.error(`Supabase error response text:`, errorBody);
              }
            } catch (err) {
              console.error(`Error parsing Supabase error response:`, err);
            }
          }
          
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

// Function to create the documents bucket if it doesn't exist
const ensureDocumentsBucketExists = async () => {
  try {
    console.log('Checking if documents bucket exists');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');
    
    if (!documentsBucketExists) {
      console.log('Documents bucket does not exist, creating it...');
      
      // Try to create the bucket
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
      if (createError) {
        console.error('Error creating documents bucket:', createError);
        
        if (createError.message?.includes('already exists')) {
          console.log('Bucket already exists despite not being in the list');
          return true;
        }
        
        return false;
      }
      
      console.log('Documents bucket created successfully:', newBucket);
      
      // Set bucket policy to allow public access
      const { error: policyError } = await supabase
        .storage
        .updateBucket('documents', {
          public: true
        });
        
      if (policyError) {
        console.error('Error setting bucket policy:', policyError);
      } else {
        console.log('Bucket policy updated successfully');
      }
      
      return true;
    } else {
      console.log('Documents bucket already exists');
      return true;
    }
  } catch (error) {
    console.error('Exception while checking/creating bucket:', error);
    return false;
  }
};

// Check database structure
export const checkDatabaseStructure = async () => {
  try {
    // Check if insurance_policies table exists
    console.log('Checking if insurance_policies table exists');
    const { error: tableError } = await supabase
      .from('insurance_policies')
      .select('count', { count: 'exact', head: true });
      
    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        console.error('Table does not exist:', tableError.message);
        toast.error('Tabela de apólices não configurada. Contate o administrador.');
        return false;
      }
      console.error('Error checking if table exists:', tableError);
      return false;
    }
    
    console.log('insurance_policies table exists');
    
    // Test user_id column
    console.log('Testing user_id column in insurance_policies table');
    const { error: columnError } = await supabase
      .from('insurance_policies')
      .select('user_id')
      .limit(1);
      
    if (columnError) {
      if (columnError.message.includes('user_id does not exist')) {
        console.error('Column user_id does not exist:', columnError.message);
        toast.error('Estrutura da tabela de apólices incorreta. Contate o administrador.');
        return false;
      }
      console.error('Error checking user_id column:', columnError);
      return false;
    }
    
    console.log('user_id column exists in insurance_policies table');
    
    // Check if documents bucket exists
    const documentsBucketExists = await ensureDocumentsBucketExists();
    if (!documentsBucketExists) {
      toast.error('Bucket de documentos não configurado. Tentando criar automaticamente...');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database structure:', error);
    return false;
  }
};

// Run checks on initialization with a delay to not block other operations
setTimeout(() => {
  // First check database structure
  checkDatabaseStructure().then(isValid => {
    if (isValid) {
      console.log('Database structure validation passed');
      
      // Then try to create documents bucket if needed
      ensureDocumentsBucketExists().then(bucketExists => {
        if (bucketExists) {
          console.log('Documents bucket is ready');
        } else {
          console.error('Could not ensure documents bucket exists');
          toast.error('Não foi possível configurar o bucket de documentos. Contate o administrador.');
        }
      });
    } else {
      console.error('Database structure validation failed');
    }
  });
}, 2000);
