
import React, { useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
    
    const checkBucket = async () => {
      try {
        // Verify authentication
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData.session) {
          console.error("Authentication error:", authError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro de autenticação. Por favor, faça login novamente.");
          return;
        }
        
        console.log("User authenticated, checking storage bucket");
        
        // Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error("Error listing buckets:", bucketError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Não foi possível acessar o sistema de armazenamento");
          return;
        }
        
        // Check if 'policy_documents' bucket exists
        const policyBucket = buckets.find(bucket => bucket.name === 'policy_documents');
        
        if (!policyBucket) {
          console.error("Bucket 'policy_documents' not found. This bucket must be created by an administrator.");
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Sistema de armazenamento não está disponível. Contate o administrador.");
          return;
        }
        
        // Double check if we have access to this bucket by listing files
        try {
          const { error: filesError } = await supabase.storage
            .from('policy_documents')
            .list(userId);
            
          if (filesError) {
            console.error("Error accessing policy_documents bucket:", filesError);
            setBucketReady(false);
            setConfiguringStorage(false);
            toast.error("Erro de acesso ao armazenamento. Contate o administrador.");
            return;
          }
          
          console.log("Bucket 'policy_documents' found and ready to use");
          setBucketReady(true);
          setConfiguringStorage(false);
        } catch (listError) {
          console.error("Error listing files in policy_documents bucket:", listError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro de acesso aos documentos. Contate o administrador.");
        }
      } catch (err) {
        console.error("Unexpected error checking storage:", err);
        toast.error("Erro ao verificar sistema de armazenamento");
        setBucketReady(false);
        setConfiguringStorage(false);
      }
    };
    
    checkBucket();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
