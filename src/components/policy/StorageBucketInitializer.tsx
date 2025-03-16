
import React, { useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

interface StorageBucketInitializerProps {
  userId?: string;
  setBucketReady: React.Dispatch<React.SetStateAction<boolean>>;
  setConfiguringStorage: React.Dispatch<React.SetStateAction<boolean>>;
}

const StorageBucketInitializer = ({ 
  userId, 
  setBucketReady, 
  setConfiguringStorage 
}: StorageBucketInitializerProps) => {
  
  useEffect(() => {
    if (!userId) return;
    
    // Start with configuration in progress
    setConfiguringStorage(true);
    
    const initializeStorage = async () => {
      try {
        console.log("Checking authentication and storage access...");
        
        // Verify authentication
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData.session) {
          console.error("Authentication error:", authError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro de autenticação. Por favor, faça login novamente.");
          return;
        }
        
        // First check if the bucket already exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error checking buckets:", bucketsError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro ao verificar sistema de armazenamento");
          return;
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === 'policy_documents');
        
        if (!bucketExists) {
          // Try to list files from the bucket first to check permissions
          const { error: accessError } = await supabase.storage
            .from('policy_documents')
            .list();
          
          if (!accessError) {
            // We can access the bucket even though it didn't show up in listBuckets
            console.log("Bucket exists but wasn't listed - we have access");
            
            // Verify we can access the user's folder
            verifyUserFolder();
            return;
          }
          
          // Try to create the bucket
          console.log("Bucket doesn't exist, attempting to create it");
          const { error: createError } = await supabase.storage.createBucket('policy_documents', {
            public: false, 
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            setBucketReady(false);
            setConfiguringStorage(false);
            
            // Special handling for RLS policy errors
            if (createError.message.includes('violates row-level security policy')) {
              toast.error("Erro de permissão. Você não tem permissão para criar o bucket.");
            } else {
              toast.error("Erro ao criar sistema de armazenamento");
            }
            return;
          }
          
          console.log("Bucket created successfully");
        } else {
          console.log("Bucket already exists");
        }
        
        // Bucket exists or was created, now verify user folder access
        verifyUserFolder();
      } catch (err) {
        console.error("Unexpected error initializing storage:", err);
        toast.error("Erro ao configurar sistema de armazenamento");
        setBucketReady(false);
        setConfiguringStorage(false);
      }
    };
    
    const verifyUserFolder = async () => {
      try {
        // Try to list files in the user's folder to verify access
        const { error: folderError } = await supabase.storage
          .from('policy_documents')
          .list(userId);
          
        if (folderError) {
          console.error("Error accessing user folder:", folderError);
          
          // Try to create an empty placeholder file to establish the folder
          const emptyFile = new Blob([''], { type: 'text/plain' });
          const placeholderPath = `${userId}/.placeholder`;
          
          const { error: uploadError } = await supabase.storage
            .from('policy_documents')
            .upload(placeholderPath, emptyFile, { upsert: true });
          
          if (uploadError) {
            console.error("Error creating user folder:", uploadError);
            setBucketReady(false);
            setConfiguringStorage(false);
            toast.error("Erro ao criar pasta do usuário");
            return;
          }
          
          console.log("User folder created successfully");
        } else {
          console.log("User folder exists and is accessible");
        }
        
        // Storage is ready
        setBucketReady(true);
        setConfiguringStorage(false);
      } catch (folderError) {
        console.error("Error checking user folder:", folderError);
        setBucketReady(false);
        setConfiguringStorage(false);
        toast.error("Erro ao verificar pasta do usuário");
      }
    };
    
    initializeStorage();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
