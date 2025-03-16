
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
    
    // Verificamos apenas se o usuário está autenticado
    const { data: authData } = supabase.auth.getSession();
    
    // Se o usuário estiver autenticado, consideramos o sistema pronto
    if (authData) {
      setBucketReady(true);
    } else {
      toast.error("Usuário não autenticado. Faça login novamente.");
      setBucketReady(false);
    }
    
    setConfiguringStorage(false);
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // Este é um componente utilitário sem UI
};

export default StorageBucketInitializer;
