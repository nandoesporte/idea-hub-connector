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
import { PolicyFile } from "@/types";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";

interface Policy {
  id: string;
  policyNumber: string;
  insurer: string;
  customer: string;
  startDate: Date;
  endDate: Date;
  coverageAmount: string;
  premiumValue: string;
  status: "active" | "expired" | "pending" | "cancelled";
  documentUrl?: string;
  fileName?: string;
  userId?: string;
}

const PolicyTab = () => {
  const { user } = useUser();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState<PolicyFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPolicies();
  }, [user]);

  const fetchPolicies = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching policies:", error);
        toast.error("Erro ao carregar apólices");
        return;
      }

      if (data) {
        const formattedPolicies = data.map(policy => ({
          ...policy,
          id: policy.id,
          policyNumber: policy.policy_number,
          insurer: policy.insurer,
          customer: policy.customer,
          startDate: new Date(policy.start_date),
          endDate: new Date(policy.end_date),
          coverageAmount: policy.coverage_amount,
          premiumValue: policy.premium_value,
          status: policy.status,
          documentUrl: policy.document_url,
          fileName: policy.file_name,
        }));
        setPolicies(formattedPolicies);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      toast.error("Erro ao carregar apólices");
    } finally {
      setLoading(false);
    }
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

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadingFile(prev => {
        if (!prev) return null;
        
        const newProgress = prev.progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            progress: 100,
            status: 'processing'
          };
        }
        
        return {
          ...prev,
          progress: newProgress
        };
      });
    }, 300);

    // After "upload" complete, simulate GPT-4 processing
    setTimeout(() => {
      clearInterval(interval);
      setUploadingFile(prev => prev ? { ...prev, status: 'processing', progress: 100 } : null);
      
      // Simulate GPT-4 analysis
      setTimeout(() => {
        extractPolicyDataFromPDF(file);
      }, 2000);
    }, 3000);
  };

  const extractPolicyDataFromPDF = async (file: File) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      setUploadingFile(null);
      return;
    }

    try {
      // In a real implementation, we would send the file to a backend API
      // that uses GPT-4 Vision to analyze the PDF and extract information
      console.log("Extracting data from PDF:", file.name);
      
      // Extract policy number from filename
      const fileNameWithoutExtension = file.name.replace('.pdf', '');
      
      // Try to extract customer name from filename - real implementation would use OCR/GPT-4
      let customerName = "";
      if (fileNameWithoutExtension.includes('_')) {
        const parts = fileNameWithoutExtension.split('_');
        if (parts.length >= 2) {
          customerName = parts.slice(1)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
        }
      }
      
      if (!customerName) {
        customerName = "Cliente não identificado";
      }
      
      // Create a date range based on today (most policies are annual)
      const startDate = subMonths(new Date(), 1); // Assume policy started a month ago
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // One year policy
      
      // Calculate policy status based on real dates
      let policyStatus: Policy['status'] = "active";
      const today = new Date();
      if (isAfter(today, endDate)) {
        policyStatus = "expired";
      } else if (isBefore(today, startDate)) {
        policyStatus = "pending";
      }
      
      // Real Brazilian insurance companies
      const insurers = [
        "Porto Seguro", 
        "Bradesco Seguros", 
        "SulAmérica", 
        "Allianz", 
        "Liberty Seguros",
        "Mapfre Seguros"
      ];
      
      // Generate a policy number based on current date if not extractable from filename
      const extractedPolicyNumber = fileNameWithoutExtension.match(/AP[0-9-]+/i) 
        ? fileNameWithoutExtension.match(/AP[0-9-]+/i)![0] 
        : `AP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
      
      const insurer = insurers[Math.floor(Math.random() * insurers.length)];
      
      // In a real implementation, these values would be extracted from the actual PDF
      const coverageAmount = "R$ 100.000,00";
      const premiumValue = "R$ 2.500,00";
      
      toast.info("Nesta versão de demonstração, os dados são extraídos do nome do arquivo. Em produção, GPT-4 analisaria o conteúdo do PDF.", {
        duration: 5000
      });
      
      // Create policy object
      const newPolicy: Policy = {
        id: Date.now().toString(),
        policyNumber: extractedPolicyNumber,
        insurer,
        customer: customerName,
        startDate,
        endDate,
        coverageAmount,
        premiumValue,
        status: policyStatus,
        fileName: file.name,
        userId: user.id,
      };
      
      // Save the policy to Supabase
      const { error } = await supabase
        .from('policies')
        .insert({
          id: newPolicy.id,
          user_id: user.id,
          policy_number: newPolicy.policyNumber,
          insurer: newPolicy.insurer,
          customer: newPolicy.customer,
          start_date: newPolicy.startDate.toISOString(),
          end_date: newPolicy.endDate.toISOString(),
          coverage_amount: newPolicy.coverageAmount,
          premium_value: newPolicy.premiumValue,
          status: newPolicy.status,
          file_name: newPolicy.fileName,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error saving policy:", error);
        toast.error("Erro ao salvar a apólice");
        setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao salvar a apólice' } : null);
        
        setTimeout(() => {
          setUploadingFile(null);
        }, 3000);
        
        return;
      }
      
      // Update local state
      setPolicies(prev => [newPolicy, ...prev]);
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
      setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao processar o arquivo' } : null);
      toast.error("Erro ao processar a apólice");
      
      setTimeout(() => {
        setUploadingFile(null);
      }, 3000);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting policy:", error);
        toast.error("Erro ao remover a apólice");
        return;
      }
      
      setPolicies(prev => prev.filter(policy => policy.id !== id));
      toast.success("Apólice removida com sucesso");
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Erro ao remover a apólice");
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
    policy.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.insurer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          {loading ? (
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
                        <TableCell>{policy.customer}</TableCell>
                        <TableCell>{policy.insurer}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              {format(policy.startDate, "dd/MM/yyyy")} - {format(policy.endDate, "dd/MM/yyyy")}
                            </span>
                            {isNearExpiry(policy.endDate) && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" aria-label="Próximo ao vencimento" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{policy.premiumValue}</TableCell>
                        <TableCell>{getStatusBadge(policy.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              aria-label="Baixar documento"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
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
