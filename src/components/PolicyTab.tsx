
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { InsurancePolicy } from '@/types';
import { 
  fetchUserPolicies, 
  uploadPolicyDocument, 
  analyzePolicyDocument, 
  createPolicy, 
  deletePolicy 
} from '@/lib/policyService';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  FileText, 
  FilePlus, 
  Trash2, 
  UploadCloud, 
  Calendar as CalendarIcon, 
  Loader2 
} from 'lucide-react';

const PolicyTab = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [policyPreview, setPolicyPreview] = useState<Partial<InsurancePolicy> | null>(null);
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies', user?.id],
    queryFn: () => user?.id ? fetchUserPolicies(user.id) : Promise.resolve([]),
    meta: {
      onError: () => {
        toast.error('Erro ao carregar as apólices. Tente novamente.');
      }
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !user?.id) return null;
      
      setIsAnalyzing(true);
      try {
        // Upload the document
        const fileUrl = await uploadPolicyDocument(selectedFile, user.id);
        
        // Analyze the uploaded document
        const analysisResult = await analyzePolicyDocument(fileUrl);
        
        // Prepare policy preview with analysis results
        setPolicyPreview({
          userId: user.id,
          policyNumber: analysisResult.policyNumber,
          customerName: analysisResult.customerName,
          customerPhone: analysisResult.customerPhone,
          issueDate: new Date(analysisResult.issueDate),
          expiryDate: new Date(analysisResult.expiryDate),
          insurer: analysisResult.insurer,
          coverageAmount: analysisResult.coverageAmount,
          premium: analysisResult.premium,
          status: 'active',
          type: analysisResult.type,
          attachmentUrl: fileUrl
        });
        
        return fileUrl;
      } catch (error) {
        console.error('Error in upload and analysis:', error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    onError: () => {
      toast.error('Erro ao processar o documento. Tente novamente.');
    }
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
      return createPolicy(policyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Apólice salva com sucesso!');
      setUploadDialog(false);
      setSelectedFile(null);
      setPolicyPreview(null);
    },
    onError: () => {
      toast.error('Erro ao salvar a apólice. Tente novamente.');
    }
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id: string) => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Apólice excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir a apólice. Tente novamente.');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para upload');
      return;
    }
    uploadMutation.mutate();
  };

  const handleSavePolicy = () => {
    if (!policyPreview || !user?.id) return;

    const requiredFields = [
      'policyNumber', 
      'customerName', 
      'issueDate', 
      'expiryDate', 
      'insurer', 
      'coverageAmount', 
      'premium'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !policyPreview[field as keyof typeof policyPreview]
    );
    
    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    createPolicyMutation.mutate(policyPreview as Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>);
  };

  const handleFieldChange = (field: keyof InsurancePolicy, value: any) => {
    setPolicyPreview(prev => prev ? { ...prev, [field]: value } : null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Apólices de Seguro</h2>
        <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
          <DialogTrigger asChild>
            <Button className="flex gap-2 items-center">
              <FilePlus className="w-4 h-4" />
              Nova Apólice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Apólice</DialogTitle>
              <DialogDescription>
                Faça o upload de um PDF da apólice para análise automática ou preencha os dados manualmente.
              </DialogDescription>
            </DialogHeader>
            
            {!policyPreview ? (
              <div className="space-y-4 py-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="policyFile">Arquivo da Apólice (PDF)</Label>
                  <Input
                    id="policyFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isAnalyzing || uploadMutation.isPending}
                  />
                  <p className="text-sm text-muted-foreground">
                    Faça upload do documento PDF da apólice para análise automática.
                  </p>
                </div>
                
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || isAnalyzing || uploadMutation.isPending} 
                  className="w-full"
                >
                  {(isAnalyzing || uploadMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Fazer Upload e Analisar
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="policyNumber">Número da Apólice</Label>
                        <Input
                          id="policyNumber"
                          value={policyPreview.policyNumber || ''}
                          onChange={(e) => handleFieldChange('policyNumber', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="insurer">Seguradora</Label>
                        <Input
                          id="insurer"
                          value={policyPreview.insurer || ''}
                          onChange={(e) => handleFieldChange('insurer', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Nome do Segurado</Label>
                        <Input
                          id="customerName"
                          value={policyPreview.customerName || ''}
                          onChange={(e) => handleFieldChange('customerName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Telefone do Segurado</Label>
                        <Input
                          id="customerPhone"
                          value={policyPreview.customerPhone || ''}
                          onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                          placeholder="Ex: 11999999999"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data de Emissão</Label>
                        <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {policyPreview.issueDate
                                ? format(policyPreview.issueDate, 'dd/MM/yyyy')
                                : "Selecionar Data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={policyPreview.issueDate}
                              onSelect={(date) => {
                                handleFieldChange('issueDate', date);
                                setIssueDateOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data de Vencimento</Label>
                        <Popover open={expiryDateOpen} onOpenChange={setExpiryDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {policyPreview.expiryDate
                                ? format(policyPreview.expiryDate, 'dd/MM/yyyy')
                                : "Selecionar Data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={policyPreview.expiryDate}
                              onSelect={(date) => {
                                handleFieldChange('expiryDate', date);
                                setExpiryDateOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coverageAmount">Valor de Cobertura (R$)</Label>
                        <Input
                          id="coverageAmount"
                          type="number"
                          value={policyPreview.coverageAmount || ''}
                          onChange={(e) => handleFieldChange('coverageAmount', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="premium">Prêmio (R$)</Label>
                        <Input
                          id="premium"
                          type="number"
                          value={policyPreview.premium || ''}
                          onChange={(e) => handleFieldChange('premium', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Seguro</Label>
                        <Input
                          id="type"
                          value={policyPreview.type || ''}
                          onChange={(e) => handleFieldChange('type', e.target.value)}
                          placeholder="Ex: Auto, Residencial, Vida"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadDialog(false);
                  setSelectedFile(null);
                  setPolicyPreview(null);
                }}
              >
                Cancelar
              </Button>
              
              {policyPreview && (
                <Button 
                  onClick={handleSavePolicy}
                  disabled={createPolicyMutation.isPending}
                >
                  {createPolicyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Apólice'
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-muted/30 rounded-full p-6 mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">Nenhuma apólice encontrada</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Carregue e analise apólices de seguro para começar a gerenciá-las aqui.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>Lista de apólices de seguro</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Segurado</TableHead>
              <TableHead>Seguradora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                <TableCell>{policy.customerName}</TableCell>
                <TableCell>{policy.insurer}</TableCell>
                <TableCell>{policy.type}</TableCell>
                <TableCell>{format(policy.expiryDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{formatCurrency(policy.coverageAmount)}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : policy.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {policy.status === 'active' 
                      ? 'Ativa' 
                      : policy.status === 'expired' 
                        ? 'Expirada' 
                        : 'Pendente Renovação'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {policy.attachmentUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={policy.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Apólice</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta apólice? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deletePolicyMutation.mutate(policy.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletePolicyMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                              </>
                            ) : (
                              'Excluir'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PolicyTab;
