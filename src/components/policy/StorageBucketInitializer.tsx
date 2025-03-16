
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
    
    // Simplificado: apenas verificamos se o usuário está autenticado
    // e assumimos que o upload funcionará
    setConfiguringStorage(true);
    
    const checkAuth = async () => {
      try {
        // Properly await the Promise returned by getSession
        const { data: authData, error } = await supabase.auth.getSession();
        
        // Se o usuário estiver autenticado, consideramos o sistema pronto
        if (authData.session) {
          setBucketReady(true);
        } else {
          toast.error("Usuário não autenticado. Faça login novamente.");
          setBucketReady(false);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        toast.error("Erro ao verificar autenticação");
        setBucketReady(false);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    checkAuth();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // Este é um componente utilitário sem UI
};

export default StorageBucketInitializer;
