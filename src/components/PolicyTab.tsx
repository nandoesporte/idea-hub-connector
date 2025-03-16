
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  RefreshCw,
  Database,
  FileUp
} from "lucide-react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { toast } from "sonner";
import { PolicyData } from "@/types";
import { 
  getAllPolicies, 
  registerWhatsAppWebhook,
  deletePolicy,
  uploadAndAnalyzePolicy
} from "@/lib/whatsgwService";

const PolicyTab = () => {
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [uploadingPolicy, setUploadingPolicy] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load policies when component mounts
    loadPolicies();
    
    // Load saved webhook URL if any
    const savedWebhookUrl = localStorage.getItem('whatsgw_webhook_url');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    setDatabaseError(null);
    try {
      // Get policies from our service
      const loadedPolicies = await getAllPolicies();
      setPolicies(loadedPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
      
      // Check if this is the "table doesn't exist" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("does not exist") || errorMessage.includes("Failed to get policies")) {
        setDatabaseError("A tabela 'insurance_policies' ainda não existe no banco de dados. Execute a migração correspondente no Supabase.");
      } else {
        toast.error("Erro ao carregar apólices");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPolicy = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPolicy(true);
    try {
      const result = await uploadAndAnalyzePolicy(file);
      if (result) {
        await loadPolicies();
        toast.success("Apólice analisada e processada com sucesso!");
      } else {
        toast.error("Não foi possível processar a apólice.");
      }
    } catch (error) {
      console.error("Error processing policy file:", error);
      
      // Check if this is the "table doesn't exist" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("does not exist")) {
        setDatabaseError("A tabela 'insurance_policies' ainda não existe no banco de dados. Execute a migração correspondente no Supabase.");
      }
      
      toast.error("Erro ao processar arquivo de apólice");
    } finally {
      setUploadingPolicy(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error("Por favor, insira uma URL de webhook válida");
      return;
    }
    
    try {
      registerWhatsAppWebhook(webhookUrl);
      toast.success("URL de webhook salva com sucesso!");
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast.error("Erro ao salvar URL de webhook");
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!policyId) {
      toast.error("ID da apólice inválido");
      return;
    }

    try {
      const result = await deletePolicy(policyId);
      
      if (result) {
        setPolicies(prev => prev.filter(policy => policy.id !== policyId));
        toast.success("Apólice removida com sucesso");
      } else {
        toast.error("Erro ao remover apólice");
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Erro ao remover apólice");
    }
  };

  const getStatusBadge = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (!startDate || !endDate) return <Badge variant="outline">Desconhecido</Badge>;
    
    const today = new Date();
    
    if (isAfter(today, endDate)) {
      return <Badge variant="destructive">Vencida</Badge>;
    } else if (isBefore(today, startDate)) {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pendente</Badge>;
    } else {
      return <Badge className="bg-green-500">Ativa</Badge>;
    }
  };

  const isNearExpiry = (date: Date | undefined) => {
    if (!date) return false;
    
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    return isAfter(date, today) && isBefore(date, thirtyDaysFromNow);
  };

  const filteredPolicies = policies.filter(policy => {
    const policyNumber = policy.policy_number || '';
    const customer = policy.customer || '';
    const insurer = policy.insurer || '';
    
    return (
      policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
          {databaseError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro de banco de dados</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>{databaseError}</p>
                <div className="mt-2 text-sm border-l-4 border-destructive/30 pl-4 py-2 bg-destructive/5 rounded">
                  <p className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" /> Solução:
                  </p>
                  <ol className="list-decimal list-inside mt-1 ml-2 space-y-1">
                    <li>Acesse o painel do Supabase</li>
                    <li>Vá para a seção SQL ou Migrations</li>
                    <li>Execute a migração <code className="bg-black/10 px-1 rounded">20240726_insurance_policies.sql</code></li>
                    <li>Volte e tente novamente</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center flex-1 space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, seguradora ou número de apólice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button 
              className="ml-4"
              onClick={handleUploadPolicy}
              disabled={uploadingPolicy}
            >
              {uploadingPolicy ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                  Processando...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" /> 
                  Enviar Apólice
                </>
              )}
            </Button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-16 w-16 mx-auto text-primary opacity-20 mb-4 animate-spin" />
              <h3 className="text-lg font-medium">Carregando apólices...</h3>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma apólice encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {searchTerm 
                  ? "Nenhum resultado encontrado para sua busca" 
                  : databaseError 
                    ? "Corrija o erro de banco de dados para visualizar apólices" 
                    : "Suas apólices de seguro aparecerão aqui"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              )}
              {!databaseError && (
                <Button 
                  variant="outline" 
                  onClick={handleUploadPolicy} 
                  className="ml-2"
                  disabled={uploadingPolicy}
                >
                  <Upload className="h-4 w-4 mr-2" /> 
                  Enviar apólice para análise
                </Button>
              )}
            </div>
          ) : (
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
                    <TableRow key={policy.id || policy.policy_number}>
                      <TableCell className="font-medium">{policy.policy_number}</TableCell>
                      <TableCell>{policy.customer || "N/A"}</TableCell>
                      <TableCell>{policy.insurer || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {policy.start_date ? format(new Date(policy.start_date), "dd/MM/yyyy") : "N/A"} - {policy.end_date ? format(new Date(policy.end_date), "dd/MM/yyyy") : "N/A"}
                          </span>
                          {policy.end_date && isNearExpiry(new Date(policy.end_date)) && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" aria-label="Próximo ao vencimento" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{`R$ ${policy.premium_amount?.toFixed(2)}` || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(policy.start_date ? new Date(policy.start_date) : undefined, policy.end_date ? new Date(policy.end_date) : undefined)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {policy.document_url && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              aria-label="Baixar documento"
                              onClick={() => window.open(policy.document_url, '_blank')}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            aria-label="Remover"
                            onClick={() => policy.id && handleDeletePolicy(policy.id)}
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
          )}
          
          <div className="bg-muted/30 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recebimento Automático via WhatsApp
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Documentos de apólice recebidos via WhatsApp com a palavra "apolice" serão automaticamente processados e adicionados ao sistema.
            </p>
            
            <div className="mt-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-xs">URL do Webhook para WhatsApp</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="webhook-url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-webhook.com/whatsgw-events" 
                    className="text-xs flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={handleSaveWebhook}
                    disabled={!webhookUrl.trim()}
                  >
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure esta URL no painel de controle do WhatsGW para receber automaticamente mensagens de documentos de apólice.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
