
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, FileUp, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PolicyFile } from "@/types";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import PolicyList from './PolicyList';
import EmptyPolicyState from './EmptyPolicyState';
import FileUploadProgress from './FileUploadProgress';
import PolicySettings from './PolicySettings';
import { uploadAndProcessPolicy, checkBucketExists } from '@/lib/policyService';
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
  const [verifyingStorage, setVerifyingStorage] = useState(false);
  const queryClient = useQueryClient();

  // Function to trigger file selection
  const triggerFileSelection = async () => {
    if (uploadingFile) {
      toast.info("Aguarde a conclusão do upload atual");
      return;
    }
    
    // Double-check bucket access before upload
    setVerifyingStorage(true);
    const isBucketAccessible = await checkBucketExists(userId);
    setVerifyingStorage(false);
    
    if (!isBucketAccessible) {
      toast.error("Sistema de armazenamento não está disponível");
      return;
    }
    
    console.log("Creating temporary input for file selection");
    
    // Create temporary input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.style.display = 'none';
    
    // Add event handler with proper typing
    fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error("Por favor, selecione um arquivo PDF");
        return;
      }
      
      console.log("File selected:", file.name);
      
      // Start upload process
      setUploadingFile({
        file,
        progress: 0,
        status: 'pending'
      });
      
      uploadAndProcessPolicy(
        file, 
        userId, 
        setUploadingFile, 
        () => {
          // Update policy list after successful upload
          queryClient.invalidateQueries({ queryKey: ['policies'] });
        }
      );
    });
    
    // Add to DOM, trigger click, then remove
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // Remove after click
    setTimeout(() => {
      document.body.removeChild(fileInput);
    }, 1000);
  };

  return (
    <>
      <PolicySearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      {!bucketReady && !configuringStorage && !isLoading && (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sistema de armazenamento indisponível</AlertTitle>
          <AlertDescription>
            O sistema de armazenamento de documentos não está disponível. Entre em contato com o administrador do sistema.
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading || configuringStorage || verifyingStorage ? (
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
              disabled={uploadingFile !== null || !bucketReady || verifyingStorage}
              className="w-full sm:w-auto"
            >
              <FileUp className="h-4 w-4 mr-2" /> 
              Enviar Apólice PDF
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
