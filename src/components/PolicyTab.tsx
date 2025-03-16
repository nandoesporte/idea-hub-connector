
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search,
  FileUp,
  Loader2
} from "lucide-react";
import { PolicyFile } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import PolicyList from './policy/PolicyList';
import EmptyPolicyState from './policy/EmptyPolicyState';
import FileUploadProgress from './policy/FileUploadProgress';
import PolicySettings from './policy/PolicySettings';
import { createStorageBucket, checkBucketExists, fetchPolicies, uploadAndProcessPolicy } from '@/lib/policyService';

const PolicyTab = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState<PolicyFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [bucketReady, setBucketReady] = useState(false);
  const [configuringStorage, setConfiguringStorage] = useState(false);

  // Check if bucket exists and create it if not
  useEffect(() => {
    const initializeStorage = async () => {
      setConfiguringStorage(true);
      try {
        // Check if bucket exists
        const exists = await checkBucketExists();
        
        if (!exists) {
          // Create bucket if it doesn't exist
          const success = await createStorageBucket();
          setBucketReady(success);
          if (!success) {
            console.error("Failed to automatically create storage bucket");
          }
        } else {
          setBucketReady(true);
        }
      } catch (error) {
        console.error("Error checking/creating storage bucket:", error);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    if (user?.id) {
      initializeStorage();
    }
  }, [user?.id]);

  // Use React Query to fetch policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies', user?.id],
    queryFn: async () => fetchPolicies(user?.id || ''),
    enabled: !!user
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    if (!bucketReady) {
      toast.error("Sistema de armazenamento não está disponível. Tente novamente em alguns instantes.");
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
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, seguradora ou número de apólice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {isLoading || configuringStorage ? (
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
                  disabled={uploadingFile !== null || !bucketReady || configuringStorage}
                  className="w-full sm:w-auto"
                >
                  {configuringStorage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Configurando sistema...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" /> 
                      Fazer upload de apólice em PDF
                    </>
                  )}
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
