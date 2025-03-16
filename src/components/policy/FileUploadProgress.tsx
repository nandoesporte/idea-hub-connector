
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { PolicyFile } from "@/types";

interface FileUploadProgressProps {
  uploadingFile: PolicyFile;
}

const FileUploadProgress = ({ uploadingFile }: FileUploadProgressProps) => {
  if (!uploadingFile) return null;
  
  return (
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
  );
};

export default FileUploadProgress;
