
import React, { useEffect } from 'react';
import { checkBucketExists, createStorageBucket } from '@/lib/policyService';
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
  // Check if bucket exists and create it if not
  useEffect(() => {
    const initializeStorage = async () => {
      setConfiguringStorage(true);
      try {
        // Check if bucket exists
        const exists = await checkBucketExists();
        
        if (exists) {
          // Bucket already exists, mark as ready
          setBucketReady(true);
        } else {
          // Try to create bucket if it doesn't exist
          try {
            const success = await createStorageBucket();
            setBucketReady(success);
            if (!success) {
              // If we can't create the bucket, we still might be able to use an existing one
              const existsAfterCreationAttempt = await checkBucketExists();
              setBucketReady(existsAfterCreationAttempt);
              
              if (!existsAfterCreationAttempt) {
                toast.error("Não foi possível configurar o armazenamento. Por favor, contate o administrador.");
              }
            }
          } catch (createError) {
            console.error("Error creating storage bucket:", createError);
            // Even if creation fails, check if the bucket might already exist
            const existsAnyway = await checkBucketExists();
            setBucketReady(existsAnyway);
            
            if (!existsAnyway) {
              toast.error("Falha ao configurar o armazenamento. Entre em contato com o suporte.");
            }
          }
        }
      } catch (error) {
        console.error("Error checking/creating storage bucket:", error);
        toast.error("Erro ao verificar armazenamento");
        setBucketReady(false);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    if (userId) {
      initializeStorage();
    }
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
