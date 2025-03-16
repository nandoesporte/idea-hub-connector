
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Search, FileUp, Loader2 } from "lucide-react";
import { PolicyFile } from "@/types";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import PolicyList from './PolicyList';
import EmptyPolicyState from './EmptyPolicyState';
import FileUploadProgress from './FileUploadProgress';
import PolicySettings from './PolicySettings';
import { uploadAndProcessPolicy } from '@/lib/policyService';
import PolicySearchBar from './PolicySearchBar';

interface PolicyTabContentProps {
  policies: any[];
  isLoading: boolean;
  configuringStorage: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onClearSearch: () => void;
  bucketReady: boolean;
  userId: string;
}

const PolicyTabContent = ({
  policies,
  isLoading,
  configuringStorage,
  searchTerm,
  setSearchTerm,
  onClearSearch,
  bucketReady,
  userId
}: PolicyTabContentProps) => {
  const [uploadingFile, setUploadingFile] = useState<PolicyFile | null>(null);
  const queryClient = useQueryClient();

  // Função simples que cria um input de arquivo temporário, 
  // registra os manipuladores de eventos e simula um clique
  const triggerFileSelection = () => {
    // Não permitir múltiplos uploads simultâneos
    if (uploadingFile) {
      toast.info("Aguarde o término do upload atual");
      return;
    }
    
    if (!bucketReady) {
      toast.error("Sistema de armazenamento não está pronto");
      return;
    }
    
    console.log("Criando input temporário para seleção de arquivo");
    
    // Criamos um input temporário para cada uso, evitando problemas de referência
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        toast.error("Por favor, selecione um arquivo PDF");
        return;
      }
      
      console.log("Arquivo selecionado:", file.name);
      
      setUploadingFile({
        file,
        progress: 0,
        status: 'pending'
      });
      
      // Start the upload process
      uploadAndProcessPolicy(
        file, 
        userId, 
        setUploadingFile, 
        () => {
          // Success callback
          queryClient.invalidateQueries({ queryKey: ['policies'] });
        }
      );
    });
    
    // Adicionar ao DOM, acionar clique e depois remover
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // Remover após o clique
    setTimeout(() => {
      document.body.removeChild(fileInput);
    }, 1000);
  };

  return (
    <>
      <PolicySearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      {isLoading || configuringStorage ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : policies.length === 0 ? (
        <EmptyPolicyState 
          searchTerm={searchTerm}
          onClearSearch={onClearSearch}
          onUploadClick={triggerFileSelection}
        />
      ) : (
        <>
          <PolicyList 
            policies={policies}
            searchTerm={searchTerm}
          />
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={triggerFileSelection}
              disabled={uploadingFile !== null || !bucketReady}
              className="w-full sm:w-auto"
            >
              <FileUp className="h-4 w-4 mr-2" /> 
              Fazer upload de apólice em PDF
            </Button>
          </div>
        </>
      )}
      
      {uploadingFile && (
        <FileUploadProgress uploadingFile={uploadingFile} />
      )}
      
      <PolicySettings />
    </>
  );
};

export default PolicyTabContent;
