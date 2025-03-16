
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileUp } from "lucide-react";

interface EmptyPolicyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onUploadClick: () => void;
}

const EmptyPolicyState = ({ searchTerm, onClearSearch, onUploadClick }: EmptyPolicyStateProps) => {
  return (
    <div className="text-center py-10">
      <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
      <h3 className="text-lg font-medium">Nenhuma apólice encontrada</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {searchTerm 
          ? "Nenhum resultado encontrado para sua busca" 
          : "Suas apólices de seguro aparecerão aqui"}
      </p>
      {searchTerm && (
        <Button variant="outline" onClick={onClearSearch}>
          Limpar busca
        </Button>
      )}
      
      <div className="mt-6">
        <Button 
          onClick={onUploadClick}
          className="w-full sm:w-auto"
        >
          <FileUp className="h-4 w-4 mr-2" /> 
          Fazer upload de apólice em PDF
        </Button>
      </div>
    </div>
  );
};

export default EmptyPolicyState;
