import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Policy } from '@/types';
import { 
  fetchPolicies, deletePolicy, 
  uploadPolicyAttachment, checkPolicyReminders,
  runInsurancePoliciesMigration, manualCheckPolicyExpirations
} from '@/lib/policyService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, Upload, Trash2, AlertTriangle, CheckCircle, 
  Calendar, Download, PlusCircle, Loader2, FileLock,
  AlertTriangle as AlertIcon, DatabaseZap, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PolicyUploadForm from './PolicyUploadForm';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [checkingExpirations, setCheckingExpirations] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (user) {
      loadPolicies();
      checkReminders();
    }
  }, [user]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.id) {
        const data = await fetchPolicies(user.id);
        setPolicies(data);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      
      // In development mode, don't show error
      if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
        setError(null);
        setPolicies([]);
      } else {
        setError('Erro ao carregar apólices. Funcionalidade pode não estar disponível no momento.');
        toast.error('Erro ao carregar apólices');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkReminders = async () => {
    try {
      if (user?.id) {
        const reminderResult = await checkPolicyReminders(user.id);
        
        if (reminderResult.hasReminders) {
          // Mostrar toast para cada apólice próxima do vencimento
          reminderResult.policies.forEach(policy => {
            toast.warning(
              `A apólice ${policy.policy_number} vence em 30 dias (${format(new Date(policy.expiry_date), 'dd/MM/yyyy')})`,
              { duration: 6000 }
            );
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error);
    }
  };

  const handleCreateTable = async () => {
    try {
      setIsMigrating(true);
      toast.info('Executando migração para criar tabela de apólices...');
      
      const result = await runInsurancePoliciesMigration();
      
      if (result.success) {
        toast.success('Tabela de apólices criada com sucesso!');
        setError(null);
        loadPolicies();
      } else {
        // In development mode, proceed anyway
        if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
          toast.success('Tabela de apólices simulada com sucesso no ambiente de desenvolvimento!');
          setError(null);
          loadPolicies();
          return;
        }
        
        toast.error('Não foi possível criar a tabela de apólices.');
        setError('Falha ao criar tabela. Contate o administrador do sistema.');
      }
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      
      // In development mode, proceed anyway
      if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
        toast.success('Tabela de apólices simulada com sucesso no ambiente de desenvolvimento!');
        setError(null);
        loadPolicies();
        return;
      }
      
      toast.error('Erro ao criar tabela de apólices');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCheckExpirations = async () => {
    try {
      setCheckingExpirations(true);
      toast.info('Verificando apólices próximas do vencimento...');
      
      const result = await manualCheckPolicyExpirations();
      
      if (!result.success) {
        toast.error('Erro ao verificar apólices');
      }
    } catch (error) {
      console.error('Erro ao verificar vencimentos:', error);
      toast.error('Erro ao verificar vencimentos');
    } finally {
      setCheckingExpirations(false);
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

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    loadPolicies();
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

  const getStatusBadge = (policy: Policy) => {
    const today = new Date();
    const expiry = new Date(policy.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiry < today) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Vencida
        </Badge>
      );
    } else if (expiry <= thirtyDaysFromNow) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Próxima do Vencimento
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Ativa
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertIcon className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Funcionalidade não disponível</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            {error}
          </p>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            A tabela de apólices pode não existir no banco de dados. Clique no botão abaixo para criar a tabela.
          </p>
          <Button 
            onClick={handleCreateTable} 
            disabled={isMigrating} 
            className="gap-2"
          >
            {isMigrating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DatabaseZap className="h-4 w-4" />
            )}
            {isMigrating ? 'Criando tabela...' : 'Criar tabela de apólices'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
        <h2 className="text-2xl font-bold mb-2">Minhas Apólices</h2>
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center gap-2'}`}>
          <Button 
            variant="outline"
            onClick={handleCheckExpirations}
            disabled={checkingExpirations}
            className={`gap-2 ${isMobile ? 'w-full mb-2' : ''}`}
          >
            {checkingExpirations ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Verificar Vencimentos
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className={isMobile ? 'w-full' : ''}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Apólice
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isMobile ? 'w-[95%]' : 'sm:max-w-md'}`}>
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Apólice</DialogTitle>
                <DialogDescription>
                  Faça upload do documento da apólice para análise automática com IA.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <PolicyUploadForm onSuccess={handleUploadSuccess} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {policies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileLock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma apólice encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comece cadastrando sua primeira apólice de seguro para gerenciamento.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" /> Upload de Apólice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="expiring-soon">A Vencer</TabsTrigger>
            <TabsTrigger value="expired">Vencidas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4 space-y-4">
            {policies
              .filter(p => {
                const today = new Date();
                const expiry = new Date(p.expiry_date);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                
                return expiry > thirtyDaysFromNow;
              })
              .map(policy => (
                <PolicyCard 
                  key={policy.id} 
                  policy={policy} 
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onDelete={handleDeletePolicy}
                  isMobile={isMobile}
                />
              ))}
          </TabsContent>

          <TabsContent value="expiring-soon" className="mt-4 space-y-4">
            {policies
              .filter(p => {
                const today = new Date();
                const expiry = new Date(p.expiry_date);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                
                return expiry <= thirtyDaysFromNow && expiry > today;
              })
              .map(policy => (
                <PolicyCard 
                  key={policy.id} 
                  policy={policy} 
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onDelete={handleDeletePolicy}
                  isMobile={isMobile}
                  cardStyle="amber"
                />
              ))}
          </TabsContent>

          <TabsContent value="expired" className="mt-4 space-y-4">
            {policies
              .filter(p => {
                const today = new Date();
                const expiry = new Date(p.expiry_date);
                return expiry < today;
              })
              .map(policy => (
                <PolicyCard 
                  key={policy.id} 
                  policy={policy} 
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onDelete={handleDeletePolicy}
                  isMobile={isMobile}
                  cardStyle="red"
                />
              ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

interface PolicyCardProps {
  policy: Policy;
  formatDate: (date: Date) => string;
  formatCurrency: (value: number) => string;
  getStatusBadge: (policy: Policy) => React.ReactNode;
  onDelete: (id: string) => void;
  isMobile: boolean;
  cardStyle?: 'green' | 'amber' | 'red';
}

const PolicyCard = ({ 
  policy, 
  formatDate, 
  formatCurrency, 
  getStatusBadge, 
  onDelete,
  isMobile,
  cardStyle = 'green'
}: PolicyCardProps) => {
  const colorMap = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  };

  return (
    <Card key={policy.id} className="overflow-hidden">
      <div className={`h-1 ${colorMap[cardStyle]} w-full`} />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{policy.insurer}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {policy.policy_number} | {policy.type.toUpperCase()}
            </p>
          </div>
          {getStatusBadge(policy)}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-sm`}>
          <div>
            <p className="text-muted-foreground">Cliente</p>
            <p className="font-medium">{policy.customer_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Valor Segurado</p>
            <p className="font-medium">{formatCurrency(policy.coverage_amount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vigência</p>
            <p className="font-medium">
              {formatDate(policy.issue_date)} a {formatDate(policy.expiry_date)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Prêmio</p>
            <p className="font-medium">{formatCurrency(policy.premium)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lembrete</p>
            <p className="font-medium">
              {policy.reminder_date ? formatDate(policy.reminder_date) : 'Não definido'}
            </p>
          </div>
        </div>
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} mt-4 gap-2`}>
          {policy.attachment_url && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className={isMobile ? 'w-full' : ''}
            >
              <a href={policy.attachment_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" /> Visualizar PDF
              </a>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-destructive ${isMobile ? 'w-full' : ''}`}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={isMobile ? 'w-[95%]' : ''}>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isto irá remover permanentemente esta apólice do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
                <AlertDialogCancel className={isMobile ? 'w-full mt-0' : ''}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(policy.id)}
                  className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${isMobile ? 'w-full' : ''}`}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyTab;
