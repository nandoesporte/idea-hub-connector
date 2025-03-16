
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { uploadPolicyAttachment, createPolicy } from '@/lib/policyService';
import { analyzePolicyDocument } from '@/api/analyze-policy';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Policy } from '@/types';

const PolicyUploadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setProgress('idle');
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
      } catch (error) {
        console.error('Error uploading file:', error);
        setProgress('error');
        setErrorMessage('Não foi possível fazer upload do arquivo. Verifique se o armazenamento está configurado.');
        setUploading(false);
        return;
      }
      
      if (!fileUrl) {
        setProgress('error');
        setErrorMessage('Falha ao obter URL do arquivo.');
        setUploading(false);
        return;
      }
      
      setUploading(false);
      setAnalyzing(true);
      setProgress('analyzing');
      toast.info('Analisando documento com IA...');

      // 2. Analisar o documento com GPT-4
      let policyData;
      try {
        policyData = await analyzePolicyDocument(fileUrl);
        console.log('Dados da apólice extraídos:', policyData);
      } catch (error) {
        console.error('Error analyzing policy:', error);
        setProgress('error');
        setErrorMessage('Falha ao analisar o documento. Serviço de IA pode estar indisponível.');
        setAnalyzing(false);
        return;
      }
      
      // 3. Criar a apólice com os dados extraídos
      if (policyData) {
        // Ensure all required fields exist before creating the policy
        const policyToCreate: Omit<Policy, "id" | "created_at" | "updated_at" | "reminder_sent"> = {
          user_id: user.id,
          policy_number: policyData.policy_number || `AP${Math.floor(Math.random() * 1000000)}`,
          customer_name: policyData.customer_name || 'Nome do Cliente',
          customer_phone: policyData.customer_phone || '',
          issue_date: policyData.issue_date || new Date(),
          expiry_date: policyData.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          insurer: policyData.insurer || 'Seguradora',
          coverage_amount: policyData.coverage_amount || 0,
          premium: policyData.premium || 0,
          status: 'active',
          type: policyData.type || 'auto',
          attachment_url: fileUrl,
          notes: policyData.notes || 'Informações extraídas automaticamente via IA'
        };
        
        try {
          const result = await createPolicy(policyToCreate);
          
          if (result === null) {
            // Se createPolicy retornar null, significa que a tabela não existe ou houve um erro
            setProgress('error');
            setErrorMessage('A tabela de apólices não existe no banco de dados. Execute as migrações necessárias ou ative o módulo de apólices no sistema.');
            setAnalyzing(false);
            return;
          }
          
          setProgress('complete');
          toast.success('Apólice cadastrada com sucesso!');
          
          // Chamar callback de sucesso se fornecido
          if (onSuccess) onSuccess();
        } catch (error) {
          console.error('Error creating policy:', error);
          setProgress('error');
          setErrorMessage('Falha ao cadastrar a apólice. A tabela pode não existir no banco de dados.');
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
      setErrorMessage('Ocorreu um erro inesperado ao processar o documento.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress('idle');
    setErrorMessage(null);
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
              <Button 
                variant="default"
                onClick={handleUpload}
                disabled={!file}
              >
                Tentar novamente
              </Button>
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
