
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [inputReady, setInputReady] = useState(false);

  // Garantir que a referência esteja pronta após montagem do componente
  useEffect(() => {
    setInputReady(true);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

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
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    );
  };

  // Esta função controla o clique no botão de upload
  const handleUploadButtonClick = () => {
    console.log("Botão de upload clicado"); // Debug para confirmar que o clique está acontecendo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("Referência ao input de arquivo é nula");
      toast.error("Erro ao abrir o seletor de arquivos");
    }
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
          onUploadClick={handleUploadButtonClick}
        />
      ) : (
        <>
          <PolicyList 
            policies={policies}
            searchTerm={searchTerm}
          />
          
          <div className="flex justify-center mt-4">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
              ref={fileInputRef}
              id="policyFileInput"
              key={inputReady ? "input-ready" : "input-not-ready"}
            />
            <Button 
              onClick={handleUploadButtonClick}
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
