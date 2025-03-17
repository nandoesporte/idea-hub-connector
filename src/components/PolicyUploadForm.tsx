
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { uploadPolicyAttachment, createPolicy, runInsurancePoliciesMigration } from '@/lib/policyService';
import { analyzePolicyDocument } from '@/api/analyze-policy';
import { createNotification } from '@/lib/notificationService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, FileText, DatabaseZap } from 'lucide-react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setProgress('idle');
      setNeedsMigration(false);
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
        setProgress('error');
        setErrorMessage('Não foi possível criar as estruturas necessárias. Contate o administrador do sistema.');
      }
    } catch (error) {
      console.error('Erro ao criar estruturas:', error);
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
      toast.info('Enviando arquivo...');

      // 1. Fazer upload do arquivo
      let fileUrl;
      try {
        fileUrl = await uploadPolicyAttachment(file, user.id);
        
        if (!fileUrl) {
          throw new Error('Falha ao obter URL do arquivo');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // Check if it's a bucket error
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
      
      setUploading(false);
      setAnalyzing(true);
      setProgress('analyzing');
      toast.info('Analisando documento com IA...');

      // 2. Analisar o documento com Groq LLM
      let policyData;
      try {
        policyData = await analyzePolicyDocument(fileUrl);
        console.log('Dados da apólice extraídos:', policyData);
        
        if (!policyData || !policyData.policy_number) {
          throw new Error('Não foi possível extrair dados essenciais do documento');
        }
      } catch (error) {
        console.error('Error analyzing policy:', error);
        setProgress('error');
        setErrorMessage(error instanceof Error ? error.message : 'Falha ao analisar o documento com IA.');
        setAnalyzing(false);
        return;
      }
      
      // 3. Criar a apólice com os dados extraídos
      if (policyData) {
        try {
          // Calcular data de lembrete (30 dias antes do vencimento)
          const expiryDate = policyData.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1));
          const reminderDate = new Date(expiryDate);
          reminderDate.setDate(reminderDate.getDate() - 30);
          
          // Usar apenas os dados exatos extraídos pelo Groq
          const policyToCreate: Omit<Policy, "id" | "created_at" | "updated_at" | "reminder_sent"> = {
            user_id: user.id,
            policy_number: policyData.policy_number || '',
            customer_name: policyData.customer_name || '',
            customer_phone: policyData.customer_phone || '',
            issue_date: policyData.issue_date || new Date(),
            expiry_date: expiryDate,
            insurer: policyData.insurer || '',
            coverage_amount: policyData.coverage_amount || 0,
            premium: policyData.premium || 0,
            status: 'active',
            type: policyData.type || '',
            attachment_url: fileUrl,
            notes: 'Dados extraídos exatamente como constam na apólice via IA'
          };
          
          // Criar a apólice no banco de dados
          const result = await createPolicy(policyToCreate);
          
          if (result === null) {
            // Verifica se precisa executar a migração
            setNeedsMigration(true);
            setProgress('error');
            setErrorMessage('A tabela de apólices não existe no banco de dados. Clique no botão abaixo para criar a tabela.');
            setAnalyzing(false);
            return;
          }
          
          // 4. Criar notificação de lembrete
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
              // Não interrompe o fluxo se a notificação falhar
            }
          }
          
          setProgress('complete');
          toast.success('Apólice cadastrada com sucesso!');
          
          // Chamar callback de sucesso se fornecido
          if (onSuccess) onSuccess();
        } catch (error) {
          console.error('Error creating policy:', error);
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
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
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
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-500 text-white p-3 rounded-full mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <p className="font-medium text-green-600">Apólice processada com sucesso!</p>
            <p className="text-sm text-muted-foreground mb-4">Os dados foram extraídos e cadastrados</p>
            
            <Button 
              variant="outline" 
              onClick={resetForm}
              className="mt-2"
            >
              Processar outro documento
            </Button>
          </div>
        )}

        {progress === 'error' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-red-500 text-white p-3 rounded-full mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <p className="font-medium text-red-600">Erro no processamento</p>
            <p className="text-sm text-muted-foreground mb-4">
              {errorMessage || 'Ocorreu um erro ao processar seu documento.'}
            </p>
            
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={resetForm}
              >
                Voltar
              </Button>
              
              {needsMigration ? (
                <Button 
                  variant="default"
                  onClick={handleMigration}
                  className="gap-2"
                >
                  <DatabaseZap className="h-4 w-4" />
                  Criar tabela e continuar
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={handleUpload}
                  disabled={!file}
                >
                  Tentar novamente
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {progress === 'idle' && (
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="gap-1.5"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Processar Documento
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PolicyUploadForm;
