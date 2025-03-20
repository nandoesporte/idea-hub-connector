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

const PolicyUploadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error' | 'migrating'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Policy> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setProgress('idle');
      setNeedsMigration(false);
      setExtractedData(null);
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
      setUploading(true);
      setProgress('uploading');
      setErrorMessage(null);
      setExtractedData(null);
      toast.info('Enviando arquivo...');

      let fileUrl;
      try {
        fileUrl = await uploadPolicyAttachment(file, user.id);
        
        if (!fileUrl) {
          throw new Error('Falha ao obter URL do arquivo');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        
        if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
          console.log('Ambiente de desenvolvimento - usando URL simulada após erro');
          fileUrl = `https://example.com/documento-simulado-${Date.now()}.pdf`;
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
      setAnalyzing(true);
      setProgress('analyzing');
      toast.info('Analisando documento com IA...');

      let policyData;
      try {
        policyData = await analyzePolicyDocument(fileUrl);
        console.log('Dados da apólice extraídos:', policyData);
        
        if (!policyData || Object.keys(policyData).length === 0) {
          throw new Error('Não foi possível extrair dados do documento');
        }
        
        if (!policyData.policy_number) {
          throw new Error('Não foi possível identificar o número da apólice no documento');
        }
        
        if (!policyData.insurer) {
          throw new Error('Não foi possível identificar a seguradora no documento');
        }
        
        setExtractedData(policyData);
      } catch (error) {
        console.error('Error analyzing policy:', error);
        setProgress('error');
        setErrorMessage(error instanceof Error ? error.message : 'Falha ao analisar o documento com IA.');
        setAnalyzing(false);
        return;
      }
      
      if (policyData) {
        try {
          const expiryDate = policyData.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1));
          const reminderDate = new Date(expiryDate);
          reminderDate.setDate(reminderDate.getDate() - 30);
          
          const policyToCreate: Omit<Policy, "id" | "created_at" | "updated_at" | "reminder_sent"> = {
            user_id: user.id,
            policy_number: policyData.policy_number || `AP-${Date.now().toString().slice(-6)}`,
            customer_name: policyData.customer_name || 'Cliente não identificado',
            customer_phone: policyData.customer_phone || '',
            issue_date: policyData.issue_date || new Date(),
            expiry_date: expiryDate,
            insurer: policyData.insurer || 'Seguradora não identificada',
            coverage_amount: policyData.coverage_amount || 0,
            premium: policyData.premium || 0,
            status: 'active',
            type: policyData.type || 'OUTRO',
            attachment_url: fileUrl,
            notes: 'Dados extraídos via IA - verificar precisão'
          };
          
          console.log('Criando apólice com os dados:', policyToCreate);
          
          const result = await createPolicy(policyToCreate);
          
          if (result === null) {
            if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
              console.log('Ambiente de desenvolvimento - simulando sucesso mesmo sem tabela');
              setProgress('complete');
              toast.success('Apólice simulada com sucesso no ambiente de desenvolvimento!');
              
              if (onSuccess) onSuccess();
              return;
            }
            
            setNeedsMigration(true);
            setProgress('error');
            setErrorMessage('A tabela de apólices não existe no banco de dados. Clique no botão abaixo para criar a tabela.');
            setAnalyzing(false);
            return;
          }
          
          if (result.id) {
            try {
              await createNotification({
                user_id: user.id,
                title: 'Nova apólice cadastrada',
                message: `A apólice ${policyData.policy_number} da ${policyData.insurer} foi cadastrada com sucesso. Um lembrete será enviado 30 dias antes do vencimento.`,
                type: 'success',
                related_entity_type: 'policy',
                related_entity_id: result.id
              });
              
              console.log('Notificação de nova apólice criada com sucesso');
            } catch (notifError) {
              console.error('Erro ao criar notificação de nova apólice:', notifError);
            }
          }
          
          setProgress('complete');
          toast.success('Apólice cadastrada com sucesso!');
          
          if (onSuccess) onSuccess();
        } catch (error) {
          console.error('Error creating policy:', error);
          
          if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
            console.log('Ambiente de desenvolvimento - simulando sucesso mesmo com erro na criação');
            setProgress('complete');
            toast.success('Apólice simulada com sucesso no ambiente de desenvolvimento!');
            
            if (onSuccess) onSuccess();
            return;
          }
          
          setProgress('error');
          setErrorMessage(error instanceof Error ? error.message : 'Falha ao cadastrar a apólice.');
          setAnalyzing(false);
          return;
        }
      } else {
        setProgress('error');
        setErrorMessage('Não foi possível extrair dados do documento.');
        setAnalyzing(false);
      }
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast.error('Falha ao processar o documento');
      setProgress('error');
      setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao processar o documento.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress('idle');
    setErrorMessage(null);
    setNeedsMigration(false);
    setExtractedData(null);
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
      <span className={`inline-flex items-center ml-2 text-xs ${hasValue ? 'text-green-600' : 'text-red-500'}`}>
        {hasValue ? 
          <Check className="h-3 w-3 mr-1" /> : 
          <AlertTriangle className="h-3 w-3 mr-1" />}
        {hasValue ? 'Identificado' : 'Não encontrado'}
      </span>
    );
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Upload de Apólice</CardTitle>
      </CardHeader>
      <CardContent>
        {progress === 'idle' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Selecione um arquivo PDF de sua apólice para análise automática
                </p>
                <p className="text-xs text-muted-foreground">
                  Nossa IA extrairá automaticamente os dados importantes
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
            <p className="font-medium">Enviando documento...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        )}

        {progress === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-medium">Analisando com IA...</p>
            <p className="text-sm text-muted-foreground">Estamos extraindo os dados da sua apólice</p>
          </div>
        )}

        {progress === 'migrating' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-medium">Criando tabela de apólices...</p>
            <p className="text-sm text-muted-foreground">Configurando o banco de dados</p>
          </div>
        )}

        {progress === 'complete' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-green-500 text-white p-3 rounded-full mb-4">
              <Check className="h-8 w-8" />
            </div>
            <p className="font-medium text-green-600">Apólice processada com sucesso!</p>
            <p className="text-sm text-muted-foreground mb-4">Os dados foram extraídos e cadastrados</p>
            
            {extractedData && (
              <div className="bg-muted p-4 rounded-lg w-full max-w-md mb-6">
                <h3 className="font-semibold mb-3 text-center text-base">Dados Extraídos da Apólice</h3>
                
                <div className="space-y-3 divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center pb-2">
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
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-2">
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
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-2">
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
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-2">
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
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-2">
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
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-muted-foreground">Vigência:</p>
                        {(extractedData.issue_date && extractedData.expiry_date) ? 
                          renderFieldStatus(true, 'Vigência') : 
                          renderFieldStatus(false, 'Vigência')}
                      </div>
                      <div className="text-sm">
                        <div className="grid grid-cols-2 gap-1">
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
                  </div>
                  
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-2">
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
                </div>
              </div>
            )}
            
            <Button onClick={resetForm} className="mt-2">
              Enviar outra apólice
            </Button>
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

