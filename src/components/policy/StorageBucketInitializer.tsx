
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
        
        // Skip bucket creation and directly try to access the user's folder
        // This is the critical change - we don't try to create the bucket at all,
        // since we know it exists at the database level
        console.log("Directly checking user folder access");
        await verifyUserFolder();
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
            toast.error("Erro ao criar pasta do usuário. Permissão negada.");
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
