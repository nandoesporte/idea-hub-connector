
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, AlertTriangle, Trash2 } from "lucide-react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { Policy } from "@/types";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PolicyListProps {
  policies: Policy[];
  searchTerm: string;
}

const PolicyList = ({ policies, searchTerm }: PolicyListProps) => {
  const queryClient = useQueryClient();

  // Use React Query mutation for deleting policies
  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error("Error deleting policy");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success("Apólice removida com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover a apólice");
    }
  });

  const handleDeletePolicy = (id: string) => {
    deletePolicyMutation.mutate(id);
  };

  const getStatusBadge = (status: Policy['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'expired':
        return <Badge variant="destructive">Vencida</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  const isNearExpiry = (date: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    return isAfter(date, today) && isBefore(date, thirtyDaysFromNow);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredPolicies = policies.filter(policy => 
    policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.insurer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredPolicies.length === 0) {
    return null;
  }

  return (
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
            <TableRow key={policy.id}>
              <TableCell className="font-medium">{policy.policyNumber}</TableCell>
              <TableCell>{policy.customerName}</TableCell>
              <TableCell>{policy.insurer}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {format(policy.issueDate, "dd/MM/yyyy")} - {format(policy.expiryDate, "dd/MM/yyyy")}
                  </span>
                  {isNearExpiry(policy.expiryDate) && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" aria-label="Próximo ao vencimento" />
                  )}
                </div>
              </TableCell>
              <TableCell>{formatCurrency(policy.premium)}</TableCell>
              <TableCell>{getStatusBadge(policy.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {policy.attachmentUrl && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      aria-label="Baixar documento"
                      onClick={() => window.open(policy.attachmentUrl, '_blank')}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    aria-label="Remover"
                    onClick={() => handleDeletePolicy(policy.id)}
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
  );
};

export default PolicyList;
