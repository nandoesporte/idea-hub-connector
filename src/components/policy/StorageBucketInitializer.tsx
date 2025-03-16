
import React, { useEffect } from 'react';
import { initializeStorage } from '@/lib/policyService';
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
  // Simplificado: assume que o armazenamento já está configurado
  useEffect(() => {
    const setupStorage = async () => {
      if (!userId) return;
      
      setConfiguringStorage(true);
      try {
        const isReady = await initializeStorage();
        setBucketReady(isReady);
        
        if (!isReady) {
          toast.error("Não foi possível acessar o armazenamento. Por favor, contate o administrador.");
        }
      } catch (error) {
        console.error("Erro ao inicializar armazenamento:", error);
        toast.error("Erro ao verificar armazenamento");
        setBucketReady(false);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    if (userId) {
      setupStorage();
    }
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // Este é um componente utilitário sem UI
};

export default StorageBucketInitializer;
