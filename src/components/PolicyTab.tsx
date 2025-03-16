
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  RefreshCw
} from "lucide-react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { toast } from "sonner";
import { 
  getAllPolicies, 
  simulateWhatsAppPolicyMessage, 
  PolicyData,
  registerWhatsAppWebhook
} from "@/lib/whatsgwService";

const PolicyTab = () => {
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Load policies when component mounts
    loadPolicies();
    
    // Load saved webhook URL if any
    const savedWebhookUrl = localStorage.getItem('whatsgw_webhook_url');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  const loadPolicies = () => {
    // Get policies from our service
    const loadedPolicies = getAllPolicies();
    setPolicies(loadedPolicies);
  };

  const handleProcessWhatsAppMessage = async () => {
    setLoading(true);
    
    try {
      const newPolicy = await simulateWhatsAppPolicyMessage();
      
      if (newPolicy) {
        // Reload policies to include the new one
        loadPolicies();
        toast.success("Nova apólice recebida e processada com sucesso!");
      } else {
        toast.error("Erro ao processar a apólice. Verifique os logs para mais detalhes.");
      }
    } catch (error) {
      console.error("Error processing WhatsApp message:", error);
      toast.error("Erro ao processar mensagem do WhatsApp");
    } finally {
      setLoading(false);
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

  const handleDeletePolicy = (policyNumber: string) => {
    // In a real app, this would call a delete API
    setPolicies(prev => prev.filter(policy => policy.policyNumber !== policyNumber));
    toast.success("Apólice removida com sucesso");
  };

  const getStatusBadge = (startDate: Date, endDate: Date) => {
    const today = new Date();
    
    if (isAfter(today, endDate)) {
      return <Badge variant="destructive">Vencida</Badge>;
    } else if (isBefore(today, startDate)) {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pendente</Badge>;
    } else {
      return <Badge className="bg-green-500">Ativa</Badge>;
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
            <Button 
              onClick={handleProcessWhatsAppMessage} 
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> 
                  Simular Recebimento
                </>
              )}
            </Button>
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
                    <TableRow key={policy.policyNumber}>
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
                      <TableCell>{getStatusBadge(policy.startDate, policy.endDate)}</TableCell>
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
                            onClick={() => handleDeletePolicy(policy.policyNumber)}
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
