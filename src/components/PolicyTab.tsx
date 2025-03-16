
import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Policy } from '@/types';
import { 
  fetchPolicies, deletePolicy, 
  uploadPolicyAttachment, analyzePolicyDocument 
} from '@/lib/policyService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, Upload, Trash2, AlertTriangle, CheckCircle, 
  Calendar, Download, PlusCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PolicyTab = () => {
  const { user } = useUser();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadPolicies();
    }
  }, [user]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const data = await fetchPolicies(user.id);
        setPolicies(data);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Erro ao carregar apólices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await deletePolicy(id);
      setPolicies(policies.filter(policy => policy.id !== id));
      toast.success('Apólice excluída com sucesso');
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Erro ao excluir apólice');
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Apólices</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Apólice
        </Button>
      </div>

      {policies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma apólice encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comece cadastrando sua primeira apólice de seguro para gerenciamento.
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" /> Upload de Apólice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="soon-to-expire">A Vencer</TabsTrigger>
            <TabsTrigger value="expired">Vencidas</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4 space-y-4">
            {policies.filter(p => p.status === 'active').map(policy => (
              <Card key={policy.id} className="overflow-hidden">
                <div className="h-1 bg-green-500 w-full" />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{policy.insurer}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {policy.policyNumber} | {policy.type.toUpperCase()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">{policy.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Segurado</p>
                      <p className="font-medium">{formatCurrency(policy.coverageAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vigência</p>
                      <p className="font-medium">
                        {formatDate(policy.issueDate)} a {formatDate(policy.expiryDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prêmio</p>
                      <p className="font-medium">{formatCurrency(policy.premium)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    {policy.attachmentUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={policy.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" /> Visualizar PDF
                        </a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá remover permanentemente esta apólice do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="soon-to-expire" className="mt-4 space-y-4">
            {/* Código similar para apólices que estão prestes a vencer */}
            <p>Apólices que vencem em breve</p>
          </TabsContent>

          <TabsContent value="expired" className="mt-4 space-y-4">
            {/* Código similar para apólices vencidas */}
            <p>Apólices vencidas</p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PolicyTab;
