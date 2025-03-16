
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  AlertTriangle, 
  Search,
  FileUp,
  Loader2,
  ServerCog
} from "lucide-react";
import { PolicyFile } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from "@/components/ui/use-toast";
import PolicyList from './policy/PolicyList';
import EmptyPolicyState from './policy/EmptyPolicyState';
import FileUploadProgress from './policy/FileUploadProgress';
import PolicySettings from './policy/PolicySettings';
import { createStorageBucket, checkBucketExists, fetchPolicies, uploadAndProcessPolicy } from '@/lib/policyService';

const STORAGE_BUCKET = 'policy_documents';

const PolicyTab = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState<PolicyFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [bucketReady, setBucketReady] = useState(false);
  const [creatingBucket, setCreatingBucket] = useState(false);

  // Check if bucket exists
  useEffect(() => {
    const checkBucket = async () => {
      const exists = await checkBucketExists();
      setBucketReady(exists);
      
      if (!exists) {
        console.log("Policy documents bucket does not exist. Please contact administrator.");
      }
    };
    
    checkBucket();
  }, []);

  // Use React Query to fetch policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies', user?.id],
    queryFn: async () => fetchPolicies(user?.id || ''),
    enabled: !!user
  });

  const handleCreateBucket = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar autenticado para esta ação");
      return;
    }

    setCreatingBucket(true);
    try {
      const success = await createStorageBucket();
      if (success) {
        setBucketReady(true);
        toast.success("Sistema de armazenamento configurado com sucesso!");
      } else {
        toast.error("Não foi possível configurar o sistema de armazenamento");
      }
    } catch (error) {
      console.error("Error creating bucket:", error);
      toast.error("Erro ao criar o bucket de armazenamento");
    } finally {
      setCreatingBucket(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    if (!bucketReady) {
      toast.error("Sistema de armazenamento não está disponível. Configure o sistema primeiro.");
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
      user?.id || '', 
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

  const handleClearSearch = () => setSearchTerm("");
  const handleUploadButtonClick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Apólices de Seguro</CardTitle>
            </div>
          </div>
          <CardDescription>
            Gerencie apólices de seguro recebidas via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!bucketReady && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-4 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Sistema de armazenamento não configurado</p>
                <p className="text-sm">O bucket de armazenamento não está disponível. Clique no botão abaixo para configurar o sistema de armazenamento.</p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 bg-white hover:bg-white/90" 
                  onClick={handleCreateBucket}
                  disabled={creatingBucket}
                >
                  {creatingBucket ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                      Configurando...
                    </>
                  ) : (
                    <>
                      <ServerCog className="h-4 w-4 mr-2" /> 
                      Configurar Sistema de Armazenamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, seguradora ou número de apólice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : policies.length === 0 ? (
            <EmptyPolicyState 
              searchTerm={searchTerm}
              onClearSearch={handleClearSearch}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyTab;
