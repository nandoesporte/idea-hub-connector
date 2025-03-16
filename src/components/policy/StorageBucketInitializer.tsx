
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
    
    // Iniciar com configuração em progresso
    setConfiguringStorage(true);
    
    const checkBucket = async () => {
      try {
        // Verificar autenticação
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData.session) {
          console.error("Erro de autenticação:", authError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Erro de autenticação. Faça login novamente.");
          return;
        }
        
        console.log("Usuário autenticado, verificando bucket de armazenamento");
        
        // Verificar se o bucket existe
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error("Erro ao listar buckets:", bucketError);
          setBucketReady(false);
          setConfiguringStorage(false);
          return;
        }
        
        // Verificar se o bucket 'policy_documents' existe
        const policyBucket = buckets.find(bucket => bucket.name === 'policy_documents');
        
        if (policyBucket) {
          console.log("Bucket 'policy_documents' encontrado e pronto para uso");
          setBucketReady(true);
        } else {
          console.log("Bucket 'policy_documents' não encontrado. Este bucket deve ser criado por um administrador.");
          toast.error("Bucket de armazenamento não está disponível. Entre em contato com o administrador.");
          setBucketReady(false);
        }
        
      } catch (err) {
        console.error("Erro inesperado ao verificar armazenamento:", err);
        toast.error("Erro ao verificar sistema de armazenamento");
        setBucketReady(false);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    checkBucket();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // Este é um componente utilitário sem UI
};

export default StorageBucketInitializer;
