
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
  const [componentMounted, setComponentMounted] = useState(false);
  
  useEffect(() => {
    // Mark component as mounted to ensure refs are established
    setComponentMounted(true);
    console.log("Component mounted, fileInputRef should be available soon");
  }, []);

  // Second useEffect to check if the ref is available after the component is mounted
  useEffect(() => {
    if (componentMounted) {
      console.log("File input reference status:", fileInputRef.current ? "Available" : "Not available");
    }
  }, [componentMounted]);

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
    console.log("Status da referência:", fileInputRef.current ? "Disponível" : "Indisponível");
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("Referência ao input de arquivo é nula");
      // Criando um input temporário caso a referência falhe
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = '.pdf';
      tempInput.style.display = 'none';
      tempInput.onchange = (e) => handleFileUpload(e as React.ChangeEvent<HTMLInputElement>);
      document.body.appendChild(tempInput);
      tempInput.click();
      // Remover após uso
      setTimeout(() => {
        document.body.removeChild(tempInput);
      }, 1000);
    }
  };

  // Renderização inline do input para garantir que esteja no DOM
  const renderFileInput = () => {
    return (
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileUpload}
        ref={fileInputRef}
        id="policyFileInput"
      />
    );
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
            {/* Render the file input directly in the component */}
            {renderFileInput()}
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
