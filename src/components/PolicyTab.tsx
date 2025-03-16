
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
import { format, addDays, isBefore, isAfter } from "date-fns";
import { toast } from "sonner";
import { PolicyFile } from "@/types";

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
}

const PolicyTab = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState<PolicyFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const mockPolicies: Policy[] = [
      {
        id: "1",
        policyNumber: "AP-2024-001",
        insurer: "Seguros XYZ",
        customer: "João Silva",
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        coverageAmount: "R$ 100.000,00",
        premiumValue: "R$ 2.500,00",
        status: "active",
        fileName: "apolice_joao_silva.pdf"
      },
      {
        id: "2",
        policyNumber: "AP-2023-045",
        insurer: "Seguradora ABC",
        customer: "Maria Oliveira",
        startDate: new Date(2023, 5, 15),
        endDate: new Date(2024, 5, 14),
        coverageAmount: "R$ 250.000,00",
        premiumValue: "R$ 3.600,00",
        status: "active",
        fileName: "apolice_maria_oliveira.pdf"
      },
      {
        id: "3",
        policyNumber: "AP-2023-098",
        insurer: "Proteção Total",
        customer: "Carlos Mendes",
        startDate: new Date(2023, 3, 10),
        endDate: new Date(2024, 3, 9),
        coverageAmount: "R$ 75.000,00",
        premiumValue: "R$ 1.800,00",
        status: "expired",
        fileName: "apolice_carlos_mendes.pdf"
      }
    ];
    
    setPolicies(mockPolicies);
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
        analyzePolicy(file);
      }, 2000);
    }, 3000);
  };

  const analyzePolicy = (file: File) => {
    try {
      // Here we would normally send the file to an API for GPT-4 analysis
      // For now, we'll simulate a response with random data
      
      const randomInsurers = ["Seguros Brasil", "Proteção Total", "Seguradora Nacional", "Confiança Seguros", "Seguro Premium"];
      const randomCustomers = ["Roberto Santos", "Ana Pereira", "Marcos Oliveira", "Carolina Lima", "Fernando Costa"];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const premiumValues = ["R$ 1.200,00", "R$ 1.750,00", "R$ 2.300,00", "R$ 3.450,00", "R$ 4.100,00"];
      
      const newPolicy: Policy = {
        id: Date.now().toString(),
        policyNumber: `AP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        insurer: randomInsurers[Math.floor(Math.random() * randomInsurers.length)],
        customer: randomCustomers[Math.floor(Math.random() * randomCustomers.length)],
        startDate,
        endDate,
        coverageAmount: `R$ ${(Math.floor(Math.random() * 900) + 100)}.000,00`,
        premiumValue: premiumValues[Math.floor(Math.random() * premiumValues.length)],
        status: "active",
        fileName: file.name
      };
      
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

  const handleDeletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== id));
    toast.success("Apólice removida com sucesso");
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
          
          {filteredPolicies.length === 0 ? (
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
