
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
        
        // Creating policy_documents bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('policy_documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createBucketError && !createBucketError.message.includes('already exists')) {
          console.error("Error creating bucket:", createBucketError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Não foi possível configurar o armazenamento");
          return;
        }
        
        console.log("Storage bucket ready or created successfully");
        
        // Create user folder if it doesn't exist
        try {
          // We'll check if we can access the user's folder
          const { error: folderError } = await supabase.storage
            .from('policy_documents')
            .list(userId);
            
          if (folderError) {
            console.error("Error accessing user folder:", folderError);
            setBucketReady(false);
            setConfiguringStorage(false);
            toast.error("Erro de acesso ao armazenamento");
            return;
          }
          
          console.log("Storage access verified successfully");
          setBucketReady(true);
          setConfiguringStorage(false);
        } catch (folderError) {
          console.error("Error checking user folder:", folderError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro ao verificar pasta do usuário");
        }
      } catch (err) {
        console.error("Unexpected error initializing storage:", err);
        toast.error("Erro ao configurar sistema de armazenamento");
        setBucketReady(false);
        setConfiguringStorage(false);
      }
    };
    
    initializeStorage();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
