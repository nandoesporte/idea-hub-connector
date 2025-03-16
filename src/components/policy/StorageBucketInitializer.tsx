
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
        
        // Get bucket information without trying to create it
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('policy_documents');
          
        if (bucketError) {
          console.error("Error getting bucket info:", bucketError);
          
          // We don't have access to the bucket or it doesn't exist
          // This is a critical error that needs admin attention
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro de acesso ao sistema de armazenamento. Entre em contato com o suporte.");
          return;
        }
        
        console.log("Bucket exists, checking user folder access");
        
        // Try to list files in the user folder
        const { data: folderData, error: folderError } = await supabase.storage
          .from('policy_documents')
          .list(userId);
          
        if (folderError) {
          console.error("Error listing user folder:", folderError);
          
          // Try to create user folder by uploading a placeholder file
          console.log("Attempting to create user folder with placeholder file");
          
          try {
            const emptyFile = new Blob([''], { type: 'text/plain' });
            const placeholderPath = `${userId}/.placeholder`;
            
            const { error: placeholderError } = await supabase.storage
              .from('policy_documents')
              .upload(placeholderPath, emptyFile, { upsert: true });
              
            if (placeholderError) {
              console.error("Failed to create user folder:", placeholderError);
              setBucketReady(false);
              setConfiguringStorage(false);
              toast.error("Erro de permissão no sistema de armazenamento. Entre em contato com o suporte.");
              return;
            }
            
            console.log("Successfully created user folder");
            setBucketReady(true);
            setConfiguringStorage(false);
          } catch (placeholderErr) {
            console.error("Exception creating user folder:", placeholderErr);
            setBucketReady(false);
            setConfiguringStorage(false);
            toast.error("Erro ao configurar pasta do usuário. Entre em contato com o suporte.");
          }
        } else {
          // User folder exists and is accessible
          console.log("User folder exists and is accessible");
          setBucketReady(true);
          setConfiguringStorage(false);
        }
      } catch (err) {
        console.error("Unexpected error initializing storage:", err);
        setBucketReady(false);
        setConfiguringStorage(false);
        toast.error("Erro inesperado ao configurar armazenamento. Entre em contato com o suporte.");
      }
    };
    
    initializeStorage();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
