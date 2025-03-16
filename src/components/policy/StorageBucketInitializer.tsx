
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
    
    const checkAndCreateBucket = async () => {
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
        
        // Se o bucket 'policy_documents' não existir, vamos criá-lo
        const bucketExists = buckets.some(bucket => bucket.name === 'policy_documents');
        
        if (!bucketExists) {
          console.log("Bucket 'policy_documents' não encontrado, tentando criar");
          
          // Tentar criar o bucket
          const { error: createError } = await supabase.storage.createBucket('policy_documents', {
            public: false,
            fileSizeLimit: 10485760, // 10MB
          });
          
          if (createError) {
            console.error("Erro ao criar bucket:", createError);
            toast.error("Erro ao configurar armazenamento de documentos");
            setBucketReady(false);
            setConfiguringStorage(false);
            return;
          }
          
          console.log("Bucket 'policy_documents' criado com sucesso");
        } else {
          console.log("Bucket 'policy_documents' já existe");
        }
        
        // Bucket está pronto para uso
        setBucketReady(true);
        console.log("Sistema de armazenamento pronto para uso");
        
      } catch (err) {
        console.error("Erro inesperado ao configurar armazenamento:", err);
        toast.error("Erro ao configurar sistema de armazenamento");
        setBucketReady(false);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    checkAndCreateBucket();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // Este é um componente utilitário sem UI
};

export default StorageBucketInitializer;
