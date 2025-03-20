
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { uploadPolicyAttachment, createPolicy, runInsurancePoliciesMigration } from '@/lib/policyService';
import { analyzePolicyDocument } from '@/api/analyze-policy';
import { createNotification } from '@/lib/notificationService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, FileText, DatabaseZap, Check, AlertTriangle, Calendar, DollarSign, User, Phone, Building, FileType } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Policy } from '@/types';
import { Badge } from '@/components/ui/badge';

const PolicyUploadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error' | 'migrating'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Policy> | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setProgress('idle');
      setNeedsMigration(false);
      setExtractedData(null);
      setUploadedFileUrl(null);
    }
  };

  const handleMigration = async () => {
    try {
      setProgress('migrating');
      toast.info('Criando tabela de apólices e bucket de documentos...');
      
      const result = await runInsurancePoliciesMigration();
      
      if (result.success) {
        toast.success('Configuração realizada com sucesso!');
        setNeedsMigration(false);
        await handleUpload();
      } else {
        if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
          console.log('Ambiente de desenvolvimento - continuando mesmo com erro na API');
          toast.success('Configuração simulada com sucesso no ambiente de desenvolvimento!');
          setNeedsMigration(false);
          await handleUpload();
          return;
        }
        
        setProgress('error');
        setErrorMessage(result.error || 'Não foi possível criar as estruturas necessárias. Contate o administrador do sistema.');
      }
    } catch (error) {
      console.error('Erro ao criar estruturas:', error);
      
      if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
        toast.success('Configuração simulada com sucesso no ambiente de desenvolvimento!');
        setNeedsMigration(false);
        await handleUpload();
        return;
      }
      
      setProgress('error');
      setErrorMessage('Erro ao configurar o sistema. Tente novamente mais tarde.');
    }
  };

  const handleUpload = async () => {
    if (!file || !user?.id) {
      toast.error('Selecione um arquivo para upload');
      return;
    }

    try {
      // Primeiro, fazer upload do arquivo para o banco de dados
      setUploading(true);
      setProgress('uploading');
      setErrorMessage(null);
      setExtractedData(null);
      toast.info('Enviando arquivo para o banco de dados...');

      let fileUrl;
      try {
        fileUrl = await uploadPolicyAttachment(file, user.id);
        
        if (!fileUrl) {
          throw new Error('Falha ao obter URL do arquivo');
        }
        
        // Salvar a URL do arquivo para usar mais tarde
        setUploadedFileUrl(fileUrl);
        toast.success('Arquivo salvo no banco de dados com sucesso!');
        
      } catch (error) {
        console.error('Error uploading file:', error);
        
        if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
          console.log('Ambiente de desenvolvimento - usando URL simulada após erro');
          fileUrl = `https://example.com/documento-simulado-${Date.now()}.pdf`;
          setUploadedFileUrl(fileUrl);
        } else {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          const isBucketError = errorMsg.includes('bucket') || errorMsg.includes('Bucket');
          
          if (isBucketError) {
            setProgress('error');
            setErrorMessage('O sistema de armazenamento não está configurado. É necessário executar a migração.');
            setNeedsMigration(true);
            setUploading(false);
            return;
          } else {
            setProgress('error');
            setErrorMessage(errorMsg);
            setUploading(false);
            return;
          }
        }
      }
      
      setUploading(false);
      
      // Agora, analisar o documento com IA
      setAnalyzing(true);
      setProgress('analyzing');
      toast.info('Analisando documento com IA para extrair informações...');

      let policyData;
      try {
        policyData = await analyzePolicyDocument(fileUrl);
        console.log('Dados brutos extraídos da apólice:', policyData);
        
        if (!policyData || Object.keys(policyData).length === 0) {
          throw new Error('Não foi possível extrair dados do documento');
        }
        
        // Validar dados essenciais
        if (!policyData.policy_number) {
          throw new Error('Não foi possível identificar o número da apólice no documento');
        }
        
        if (!policyData.insurer) {
          throw new Error('Não foi possível identificar a seguradora no documento');
        }
        
        // Formatar e melhorar os dados extraídos para exibição
        const processedData = {
          ...policyData,
          // Garantir que datas sejam formatadas corretamente
          issue_date: policyData.issue_date instanceof Date ? policyData.issue_date : new Date(),
          expiry_date: policyData.expiry_date instanceof Date ? policyData.expiry_date : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          // Calcular data de lembrete (30 dias antes do vencimento)
          reminder_date: policyData.expiry_date instanceof Date ? 
            new Date(new Date(policyData.expiry_date).setDate(new Date(policyData.expiry_date).getDate() - 30)) : 
            new Date(new Date().setMonth(new Date().getMonth() + 11)),
        };
        
        setExtractedData(processedData);
        toast.success('Dados extraídos com sucesso!');
      } catch (error) {
        console.error('Error analyzing policy:', error);
        setProgress('error');
        setErrorMessage(error instanceof Error ? error.message : 'Falha ao analisar o documento com IA.');
        setAnalyzing(false);
        return;
      }
      
      setAnalyzing(false);
      setProgress('complete');
      
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast.error('Falha ao processar o documento');
      setProgress('error');
      setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao processar o documento.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleSavePolicy = async () => {
    if (!extractedData || !uploadedFileUrl || !user?.id) {
      toast.error('Dados incompletos para salvar a apólice');
      return;
    }

    try {
      setUploading(true);
      toast.info('Salvando apólice no sistema...');

      const expiryDate = extractedData.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      const reminderDate = new Date(expiryDate);
      reminderDate.setDate(reminderDate.getDate() - 30);
      
      const policyToCreate: Omit<Policy, "id" | "created_at" | "updated_at" | "reminder_sent"> = {
        user_id: user.id,
        policy_number: extractedData.policy_number || `AP-${Date.now().toString().slice(-6)}`,
        customer_name: extractedData.customer_name || 'Cliente não identificado',
        customer_phone: extractedData.customer_phone || '',
        issue_date: extractedData.issue_date || new Date(),
        expiry_date: expiryDate,
        insurer: extractedData.insurer || 'Seguradora não identificada',
        coverage_amount: extractedData.coverage_amount || 0,
        premium: extractedData.premium || 0,
        status: 'active',
        type: extractedData.type || 'OUTRO',
        attachment_url: uploadedFileUrl,
        notes: 'Dados extraídos via IA - verificar precisão',
        reminder_date: reminderDate
      };
      
      console.log('Salvando apólice com os dados:', policyToCreate);
      
      const result = await createPolicy(policyToCreate);
      
      if (result === null) {
        if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
          console.log('Ambiente de desenvolvimento - simulando sucesso mesmo sem tabela');
          toast.success('Apólice simulada com sucesso no ambiente de desenvolvimento!');
          
          if (onSuccess) onSuccess();
          return;
        }
        
        setNeedsMigration(true);
        setProgress('error');
        setErrorMessage('A tabela de apólices não existe no banco de dados. Clique no botão abaixo para criar a tabela.');
        setUploading(false);
        return;
      }
      
      if (result.id) {
        try {
          await createNotification({
            user_id: user.id,
            title: 'Nova apólice cadastrada',
            message: `A apólice ${policyToCreate.policy_number} da ${policyToCreate.insurer} foi cadastrada com sucesso. Um lembrete será enviado 30 dias antes do vencimento (${format(reminderDate, 'dd/MM/yyyy')}).`,
            type: 'success',
            related_entity_type: 'policy',
            related_entity_id: result.id
          });
          
          console.log('Notificação de nova apólice criada com sucesso');
        } catch (notifError) {
          console.error('Erro ao criar notificação de nova apólice:', notifError);
        }
      }
      
      toast.success('Apólice cadastrada com sucesso!');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving policy:', error);
      
      if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
        console.log('Ambiente de desenvolvimento - simulando sucesso mesmo com erro na criação');
        toast.success('Apólice simulada com sucesso no ambiente de desenvolvimento!');
        
        if (onSuccess) onSuccess();
        return;
      }
      
      toast.error('Falha ao salvar a apólice');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress('idle');
    setErrorMessage(null);
    setNeedsMigration(false);
    setExtractedData(null);
    setUploadedFileUrl(null);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderFieldStatus = (value: any, label: string) => {
    const hasValue = value !== undefined && value !== null && value !== '';
    return (
      <Badge variant={hasValue ? "outline" : "destructive"} className={`ml-2 ${hasValue ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700'}`}>
        {hasValue ? 
          <><Check className="h-3 w-3 mr-1 inline" /> Extraído</> : 
          <><AlertTriangle className="h-3 w-3 mr-1 inline" /> Não encontrado</>}
      </Badge>
    );
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Upload e Análise de Apólice</CardTitle>
      </CardHeader>
      <CardContent>
        {progress === 'idle' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Selecione um arquivo PDF da apólice para upload e análise automática
                </p>
                <p className="text-xs text-muted-foreground">
                  1. O arquivo será salvo no banco de dados
                </p>
                <p className="text-xs text-muted-foreground">
                  2. A IA extrairá automaticamente os dados da apólice
                </p>
                <p className="text-xs text-muted-foreground">
                  3. Você poderá confirmar os dados e salvar a apólice no sistema
                </p>
              </div>
              
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
            </div>
            
            {file && (
              <div className="bg-muted p-2 rounded text-sm">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}

        {progress === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-medium">Salvando documento no banco de dados...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        )}

        {progress === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-medium">Analisando documento com IA...</p>
            <p className="text-sm text-muted-foreground">Extraindo informações da sua apólice</p>
          </div>
        )}

        {progress === 'migrating' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-medium">Criando tabela de apólices...</p>
            <p className="text-sm text-muted-foreground">Configurando o banco de dados</p>
          </div>
        )}

        {progress === 'complete' && extractedData && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-green-100 text-green-800 p-4 rounded-lg w-full mb-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Análise de Apólice Concluída</h3>
              </div>
              <p className="text-sm mt-1">O documento foi salvo e as informações foram extraídas automaticamente.</p>
              <p className="text-sm mt-1">Verifique se os dados estão corretos antes de salvar no sistema.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg w-full max-w-md mb-6 shadow-sm overflow-hidden">
              <div className="bg-primary/10 p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-center text-base">Dados Extraídos da Apólice</h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="space-y-3 divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center pb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileType className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Número da Apólice:</p>
                        {renderFieldStatus(extractedData.policy_number, 'Número da Apólice')}
                      </div>
                      <p className="text-sm font-bold">{extractedData.policy_number || 'Não identificado'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Cliente:</p>
                        {renderFieldStatus(extractedData.customer_name, 'Cliente')}
                      </div>
                      <p className="text-sm font-bold">{extractedData.customer_name || 'Não identificado'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Telefone:</p>
                        {renderFieldStatus(extractedData.customer_phone, 'Telefone')}
                      </div>
                      <p className="text-sm font-bold">{extractedData.customer_phone || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Seguradora:</p>
                        {renderFieldStatus(extractedData.insurer, 'Seguradora')}
                      </div>
                      <p className="text-sm font-bold">{extractedData.insurer || 'Não identificada'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileType className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Tipo:</p>
                        {renderFieldStatus(extractedData.type, 'Tipo')}
                      </div>
                      <p className="text-sm font-bold">{extractedData.type || 'Não identificado'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Vigência:</p>
                        {renderFieldStatus(extractedData.issue_date && extractedData.expiry_date, 'Vigência')}
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <div>
                          <span className="text-xs text-muted-foreground">Início:</span>
                          <span className="font-bold block">
                            {extractedData.issue_date ? formatDate(extractedData.issue_date) : 'Não identificado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Fim:</span>
                          <span className="font-bold block">
                            {extractedData.expiry_date ? formatDate(extractedData.expiry_date) : 'Não identificado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-muted-foreground">Cobertura:</p>
                            {renderFieldStatus(extractedData.coverage_amount, 'Cobertura')}
                          </div>
                          <p className="text-sm font-bold text-green-600 dark:text-green-500">
                            {formatCurrency(extractedData.coverage_amount || 0)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-muted-foreground">Prêmio:</p>
                            {renderFieldStatus(extractedData.premium, 'Prêmio')}
                          </div>
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-500">
                            {formatCurrency(extractedData.premium || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Lembrete de Vencimento:</p>
                      </div>
                      <div className="text-sm mt-1">
                        <div className="bg-amber-50 p-2 rounded border border-amber-200">
                          <p className="text-amber-700">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Um lembrete será enviado em <strong>{extractedData.reminder_date ? formatDate(extractedData.reminder_date) : '30 dias antes do vencimento'}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePolicy} 
                className="flex-1 gap-2"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Salvar Apólice
              </Button>
            </div>
          </div>
        )}

        {progress === 'error' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-red-500 text-white p-3 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="font-medium text-red-600">Ocorreu um erro</p>
            <p className="text-sm text-center text-muted-foreground mb-4">
              {errorMessage || 'Não foi possível processar o documento.'}
            </p>
            
            {needsMigration ? (
              <Button onClick={handleMigration} className="mb-2 flex items-center gap-2">
                <DatabaseZap className="h-4 w-4" />
                Configurar sistema
              </Button>
            ) : (
              <Button onClick={resetForm} className="mb-2">
                Tentar novamente
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {progress === 'idle' && file && (
        <CardFooter className="flex justify-end border-t pt-4">
          <Button onClick={handleUpload} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Processar Documento
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PolicyUploadForm;
