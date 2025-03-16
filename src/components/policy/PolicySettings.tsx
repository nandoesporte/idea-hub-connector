
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock } from "lucide-react";

const PolicySettings = () => {
  return (
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
  );
};

export default PolicySettings;
