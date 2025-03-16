
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Upload,
  Trash2,
  Search,
  FileUp,
  Loader2
} from "lucide-react";
import { format, addDays, isBefore, isAfter, subMonths } from "date-fns";
import { toast } from "sonner";
import { PolicyFile, Policy } from "@/types";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STORAGE_BUCKET = 'policy_documents';

const PolicyTab = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState<PolicyFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Ensure the storage bucket exists
  useEffect(() => {
    const createBucketIfNotExists = async () => {
      try {
        // Check if the bucket already exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
        
        if (!bucketExists) {
          // Create the bucket if it doesn't exist
          const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
            public: true
          });
          
          if (error) {
            console.error("Error creating storage bucket:", error);
          } else {
            console.log("Storage bucket created successfully");
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }
    };
    
    createBucketIfNotExists();
  }, []);

  // Use React Query to fetch policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching policies:", error);
        toast.error("Erro ao carregar apólices");
        return [];
      }

      return data.map(policy => ({
        id: policy.id,
        userId: policy.user_id,
        policyNumber: policy.policy_number,
        customerName: policy.customer,
        issueDate: new Date(policy.start_date),
        expiryDate: new Date(policy.end_date),
        insurer: policy.insurer,
        coverageAmount: parseFloat(policy.coverage_amount.replace(/[^0-9.]/g, '')),
        premium: parseFloat(policy.premium_value.replace(/[^0-9.]/g, '')),
        status: policy.status,
        type: policy.type || 'general',
        createdAt: new Date(policy.created_at),
        updatedAt: new Date(policy.created_at),
        attachmentUrl: policy.document_url,
      }));
    },
    enabled: !!user
  });

  // Use React Query mutation for deleting policies
  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error("Error deleting policy");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success("Apólice removida com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover a apólice");
    }
  });

  const handleDeletePolicy = (id: string) => {
    deletePolicyMutation.mutate(id);
  };

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
    uploadAndProcessPDF(file);
  };

  const uploadAndProcessPDF = async (file: File) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      setUploadingFile(null);
      return;
    }

    try {
      // Simulate upload progress (in a real app, this would track the actual upload)
      const progressInterval = setInterval(() => {
        setUploadingFile(prev => {
          if (!prev) return null;
          
          const newProgress = Math.min(prev.progress + 5, 95);
          return {
            ...prev,
            progress: newProgress
          };
        });
      }, 100);

      // Ensure the user folder exists
      const userFolderPath = `policies/${user.id}`;
      
      // 1. Upload the file to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userFolderPath}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao fazer upload do arquivo' } : null);
        toast.error("Erro ao fazer upload do arquivo");
        return;
      }

      // Set progress to 100% for upload complete
      setUploadingFile(prev => prev ? { ...prev, progress: 100, status: 'processing' } : null);

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // 2. Convert PDF to base64 for GPT-4 Vision
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result?.toString().split(',')[1];
          
          // 3. Call GPT-4 Vision to analyze the PDF
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-policy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              pdfBase64: base64Data,
              fileName: file.name
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to analyze PDF');
          }

          const policyData = await response.json();

          // 4. Use the extracted data to create a policy record
          const today = new Date();
          
          // Set policy status based on date
          let policyStatus: Policy['status'] = "active";
          if (isAfter(today, new Date(policyData.expiryDate))) {
            policyStatus = "expired";
          } else if (isBefore(today, new Date(policyData.issueDate))) {
            policyStatus = "pending";
          }
          
          // 5. Save the policy to Supabase
          const { error: saveError } = await supabase
            .from('policies')
            .insert({
              user_id: user.id,
              policy_number: policyData.policyNumber,
              insurer: policyData.insurer,
              customer: policyData.customerName,
              start_date: new Date(policyData.issueDate).toISOString(),
              end_date: new Date(policyData.expiryDate).toISOString(),
              coverage_amount: policyData.coverageAmount,
              premium_value: policyData.premium,
              status: policyStatus,
              document_url: publicUrl,
              file_name: file.name
            });

          if (saveError) {
            console.error("Error saving policy:", saveError);
            setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao salvar a apólice' } : null);
            toast.error("Erro ao salvar a apólice");
            return;
          }
          
          // Refresh the policies list
          queryClient.invalidateQueries({ queryKey: ['policies'] });
          
          setUploadingFile(prev => prev ? { ...prev, status: 'success' } : null);
          toast.success("Apólice processada com sucesso!");
          
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          
          // Reset upload state after a delay
          setTimeout(() => {
            setUploadingFile(null);
          }, 2000);
          
        } catch (error) {
          console.error("Error analyzing policy:", error);
          setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao analisar o documento' } : null);
          toast.error("Erro ao analisar o documento PDF");
          
          setTimeout(() => {
            setUploadingFile(null);
          }, 3000);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao ler o arquivo' } : null);
        toast.error("Erro ao ler o arquivo");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing policy:", error);
      setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao processar o arquivo' } : null);
      toast.error("Erro ao processar a apólice");
      
      setTimeout(() => {
        setUploadingFile(null);
      }, 3000);
    }
  };

  const getStatusBadge = (status: Policy['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'expired':
        return <Badge variant="destructive">Vencida</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  const isNearExpiry = (date: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    return isAfter(date, today) && isBefore(date, thirtyDaysFromNow);
  };

  const filteredPolicies = policies.filter(policy => 
    policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.insurer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma apólice encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {searchTerm 
                  ? "Nenhum resultado encontrado para sua busca" 
                  : "Suas apólices de seguro aparecerão aqui"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              )}
              
              <div className="mt-6">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile !== null}
                  className="w-full sm:w-auto"
                >
                  <FileUp className="h-4 w-4 mr-2" /> 
                  Fazer upload de apólice em PDF
                </Button>
              </div>
              
              {uploadingFile && (
                <div className="mt-4 max-w-md mx-auto bg-background border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {uploadingFile.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {uploadingFile.status === 'pending' && 'Enviando...'}
                      {uploadingFile.status === 'processing' && 'Analisando documento...'}
                      {uploadingFile.status === 'success' && 'Concluído!'}
                      {uploadingFile.status === 'error' && 'Erro!'}
                    </span>
                  </div>
                  
                  <Progress value={uploadingFile.progress} className="h-2 mb-2" />
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    {uploadingFile.status === 'pending' && (
                      <div className="flex items-center">
                        <Upload className="h-3.5 w-3.5 mr-1" /> Enviando arquivo...
                      </div>
                    )}
                    {uploadingFile.status === 'processing' && (
                      <div className="flex items-center">
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Analisando com GPT-4...
                      </div>
                    )}
                    {uploadingFile.status === 'success' && (
                      <div className="flex items-center text-green-500">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Análise concluída com sucesso!
                      </div>
                    )}
                    {uploadingFile.status === 'error' && (
                      <div className="flex items-center text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> {uploadingFile.error || "Erro ao processar o arquivo"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número da Apólice</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Seguradora</TableHead>
                      <TableHead>Vigência</TableHead>
                      <TableHead>Valor do Prêmio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                        <TableCell>{policy.customerName}</TableCell>
                        <TableCell>{policy.insurer}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              {format(policy.issueDate, "dd/MM/yyyy")} - {format(policy.expiryDate, "dd/MM/yyyy")}
                            </span>
                            {isNearExpiry(policy.expiryDate) && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" aria-label="Próximo ao vencimento" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(policy.premium)}</TableCell>
                        <TableCell>{getStatusBadge(policy.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {policy.attachmentUrl && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                aria-label="Baixar documento"
                                onClick={() => window.open(policy.attachmentUrl, '_blank')}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              aria-label="Remover"
                              onClick={() => handleDeletePolicy(policy.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-center mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile !== null}
                  className="w-full sm:w-auto"
                >
                  <FileUp className="h-4 w-4 mr-2" /> 
                  Fazer upload de apólice em PDF
                </Button>
              </div>
              
              {uploadingFile && (
                <div className="mt-4 max-w-md mx-auto bg-background border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {uploadingFile.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {uploadingFile.status === 'pending' && 'Enviando...'}
                      {uploadingFile.status === 'processing' && 'Analisando documento...'}
                      {uploadingFile.status === 'success' && 'Concluído!'}
                      {uploadingFile.status === 'error' && 'Erro!'}
                    </span>
                  </div>
                  
                  <Progress value={uploadingFile.progress} className="h-2 mb-2" />
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    {uploadingFile.status === 'pending' && (
                      <div className="flex items-center">
                        <Upload className="h-3.5 w-3.5 mr-1" /> Enviando arquivo...
                      </div>
                    )}
                    {uploadingFile.status === 'processing' && (
                      <div className="flex items-center">
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Analisando com GPT-4...
                      </div>
                    )}
                    {uploadingFile.status === 'success' && (
                      <div className="flex items-center text-green-500">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Análise concluída com sucesso!
                      </div>
                    )}
                    {uploadingFile.status === 'error' && (
                      <div className="flex items-center text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> {uploadingFile.error || "Erro ao processar o arquivo"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="bg-muted/30 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recebimento Automático via WhatsApp
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Documentos de apólice recebidos via WhatsApp com a palavra "apolice" serão automaticamente processados e adicionados ao sistema.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="days-before" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Dias para lembrete antes do vencimento
                </Label>
                <Input 
                  id="days-before" 
                  type="number" 
                  defaultValue={30} 
                  min={1} 
                  max={90}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="default-phone" className="text-xs">Número padrão para lembretes</Label>
                <Input 
                  id="default-phone" 
                  type="tel" 
                  placeholder="Ex: 11987654321" 
                  className="h-8 mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyTab;
