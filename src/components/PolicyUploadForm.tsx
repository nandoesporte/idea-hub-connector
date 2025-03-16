
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

const PolicyUploadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      toast.info('Enviando arquivo...');

      // 1. Fazer upload do arquivo
      const fileUrl = await uploadPolicyAttachment(file, user.id);
      
      setUploading(false);
      setAnalyzing(true);
      setProgress('analyzing');
      toast.info('Analisando documento com IA...');

      // 2. Analisar o documento com GPT-4
      const policyData = await analyzePolicyDocument(fileUrl);
      
      // 3. Criar a apólice com os dados extraídos
      if (policyData) {
        await createPolicy({
          ...policyData,
          user_id: user.id,
          attachment_url: fileUrl,
          status: 'active'
        });
        
        setProgress('complete');
        toast.success('Apólice cadastrada com sucesso!');
        
        // Chamar callback de sucesso se fornecido
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast.error('Falha ao processar o documento');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
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
              onClick={() => setProgress('idle')}
              className="mt-2"
            >
              Processar outro documento
            </Button>
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
