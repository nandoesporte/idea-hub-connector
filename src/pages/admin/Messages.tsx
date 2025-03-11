
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mail, Check, X, AlertCircle, MoreHorizontal, Reply } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  response?: string;
  respondedAt?: Date;
}

// Mock data for messages
const mockMessages: Message[] = [
  {
    id: '1',
    name: 'Roberto Alves',
    email: 'roberto.alves@example.com',
    subject: 'Orçamento para sistema de gestão',
    message: 'Gostaria de solicitar um orçamento para desenvolvimento de um sistema de gestão para minha empresa. Precisamos de funcionalidades específicas para controle de estoque e finanças.',
    status: 'unread',
    createdAt: new Date('2023-06-15T14:30:00')
  },
  {
    id: '2',
    name: 'Camila Ferreira',
    email: 'camila.ferreira@example.com',
    subject: 'Dúvida sobre prazo de entrega',
    message: 'Olá, gostaria de saber qual o prazo médio de entrega para um website institucional com 5 páginas e blog integrado.',
    status: 'read',
    createdAt: new Date('2023-06-14T09:45:00')
  },
  {
    id: '3',
    name: 'Marcelo Santos',
    email: 'marcelo.santos@example.com',
    subject: 'Problema com formulário de contato',
    message: 'Estou tentando enviar uma mensagem pelo formulário de contato do site de vocês, mas está dando erro. Podem verificar?',
    status: 'replied',
    createdAt: new Date('2023-06-13T16:20:00'),
    response: 'Olá Marcelo, obrigado por nos alertar. Identificamos o problema e já foi corrigido. Pode tentar novamente.',
    respondedAt: new Date('2023-06-13T17:45:00')
  },
  {
    id: '4',
    name: 'Juliana Costa',
    email: 'juliana.costa@example.com',
    subject: 'Proposta de parceria',
    message: 'Gostaria de propor uma parceria entre nossas empresas. Somos uma agência de marketing digital e acredito que podemos trabalhar juntos em projetos futuros.',
    status: 'archived',
    createdAt: new Date('2023-06-12T11:10:00')
  },
  {
    id: '5',
    name: 'Felipe Martins',
    email: 'felipe.martins@example.com',
    subject: 'Feedback sobre o serviço',
    message: 'Gostaria de agradecer pelo excelente trabalho no desenvolvimento do meu site. Ficou incrível e já estamos recebendo muitos elogios dos clientes.',
    status: 'unread',
    createdAt: new Date('2023-06-11T15:50:00')
  }
];

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const handleUpdateStatus = (id: string, status: Message['status']) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, status } : message
    ));
    
    const statusMessages = {
      'read': 'Mensagem marcada como lida.',
      'unread': 'Mensagem marcada como não lida.',
      'replied': 'Mensagem marcada como respondida.',
      'archived': 'Mensagem arquivada.'
    };
    
    toast.success(statusMessages[status] || 'Status da mensagem atualizado.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      setMessages(messages.filter(message => message.id !== id));
      toast.success('Mensagem excluída com sucesso.');
    }
  };

  const handleViewMessage = (message: Message) => {
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      handleUpdateStatus(message.id, 'read');
      message = { ...message, status: 'read' };
    }
    setViewingMessage(message);
    setShowMessageModal(true);
  };

  const handleOpenReplyModal = (message: Message) => {
    setViewingMessage(message);
    setReplyText(message.response || '');
    setShowReplyModal(true);
  };

  const handleSendReply = () => {
    if (!viewingMessage) return;
    
    if (!replyText.trim()) {
      toast.error('A resposta não pode estar vazia');
      return;
    }
    
    const updatedMessage = {
      ...viewingMessage,
      status: 'replied' as const,
      response: replyText,
      respondedAt: new Date()
    };
    
    setMessages(messages.map(message => 
      message.id === viewingMessage.id ? updatedMessage : message
    ));
    
    setShowReplyModal(false);
    toast.success('Resposta enviada com sucesso');
  };

  const handleMarkAllAsRead = () => {
    setMessages(messages.map(message => 
      message.status === 'unread' ? { ...message, status: 'read' } : message
    ));
    toast.success('Todas as mensagens foram marcadas como lidas');
  };

  // Filter messages based on search query and active tab
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return matchesSearch && message.status === 'unread';
    if (activeTab === 'read') return matchesSearch && (message.status === 'read' || message.status === 'replied');
    if (activeTab === 'archived') return matchesSearch && message.status === 'archived';
    
    return false;
  });

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AdminLayout
      title="Gerenciamento de Mensagens"
      description="Visualize e responda às mensagens recebidas através do formulário de contato."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou assunto..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Marcar todas como lidas
            </Button>
            <Button onClick={() => toast.info('Esta funcionalidade será implementada em breve.')}>
              Exportar mensagens
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Mensagens de Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  Todas ({messages.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Não lidas ({messages.filter(m => m.status === 'unread').length})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Lidas/Respondidas ({messages.filter(m => m.status === 'read' || m.status === 'replied').length})
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Arquivadas ({messages.filter(m => m.status === 'archived').length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <MessageTable 
                  messages={filteredMessages} 
                  onUpdateStatus={handleUpdateStatus} 
                  onDelete={handleDelete}
                  onViewMessage={handleViewMessage}
                  onReply={handleOpenReplyModal}
                  formatDateTime={formatDateTime}
                />
              </TabsContent>
              
              <TabsContent value="unread">
                <MessageTable 
                  messages={filteredMessages} 
                  onUpdateStatus={handleUpdateStatus} 
                  onDelete={handleDelete}
                  onViewMessage={handleViewMessage}
                  onReply={handleOpenReplyModal}
                  formatDateTime={formatDateTime}
                />
              </TabsContent>
              
              <TabsContent value="read">
                <MessageTable 
                  messages={filteredMessages} 
                  onUpdateStatus={handleUpdateStatus} 
                  onDelete={handleDelete}
                  onViewMessage={handleViewMessage}
                  onReply={handleOpenReplyModal}
                  formatDateTime={formatDateTime}
                />
              </TabsContent>
              
              <TabsContent value="archived">
                <MessageTable 
                  messages={filteredMessages} 
                  onUpdateStatus={handleUpdateStatus} 
                  onDelete={handleDelete}
                  onViewMessage={handleViewMessage}
                  onReply={handleOpenReplyModal}
                  formatDateTime={formatDateTime}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Message View Modal */}
        {viewingMessage && (
          <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{viewingMessage.subject}</DialogTitle>
                <DialogDescription>
                  De {viewingMessage.name} ({viewingMessage.email})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Recebido em {formatDateTime(viewingMessage.createdAt)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Mensagem:</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-line">{viewingMessage.message}</p>
                  </div>
                </div>
                
                {viewingMessage.response && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-medium">Resposta:</h4>
                    <div className="p-3 bg-primary/10 rounded-md">
                      <p className="whitespace-pre-line">{viewingMessage.response}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Respondido em {viewingMessage.respondedAt ? formatDateTime(viewingMessage.respondedAt) : ''}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                {viewingMessage.status !== 'replied' && (
                  <Button onClick={() => {
                    setShowMessageModal(false);
                    handleOpenReplyModal(viewingMessage);
                  }}>
                    <Reply className="h-4 w-4 mr-2" /> Responder
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Reply Modal */}
        {viewingMessage && (
          <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Responder para {viewingMessage.name}</DialogTitle>
                <DialogDescription>
                  Re: {viewingMessage.subject}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border p-3 rounded-md bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Mensagem original:</p>
                  <p className="text-sm">{viewingMessage.message}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Sua resposta:</h4>
                  <Textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowReplyModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSendReply}>
                  Enviar Resposta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

interface MessageTableProps {
  messages: Message[];
  onUpdateStatus: (id: string, status: Message['status']) => void;
  onDelete: (id: string) => void;
  onViewMessage: (message: Message) => void;
  onReply: (message: Message) => void;
  formatDateTime: (date: Date) => string;
}

const MessageTable = ({ 
  messages, 
  onUpdateStatus,
  onDelete,
  onViewMessage,
  onReply,
  formatDateTime 
}: MessageTableProps) => {
  const getStatusBadge = (status: Message['status']) => {
    switch (status) {
      case 'unread':
        return <Badge variant="secondary" className="bg-yellow-500">Não lida</Badge>;
      case 'read':
        return <Badge variant="outline">Lida</Badge>;
      case 'replied':
        return <Badge variant="success" className="bg-green-500">Respondida</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-300">Arquivada</Badge>;
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Nenhuma mensagem encontrada.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Remetente</TableHead>
          <TableHead>Assunto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow 
            key={message.id} 
            className={message.status === 'unread' ? 'font-medium bg-muted/30' : ''}
            onClick={() => onViewMessage(message)}
            style={{ cursor: 'pointer' }}
          >
            <TableCell>
              <div>
                <div className="font-medium">{message.name}</div>
                <div className="text-sm text-muted-foreground">{message.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className={message.status === 'unread' ? 'font-medium' : ''}>{message.subject}</div>
                <div className="text-sm text-muted-foreground">
                  {truncateText(message.message, 60)}
                </div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(message.status)}</TableCell>
            <TableCell>{formatDateTime(message.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onViewMessage(message);
                  }}>
                    Visualizar
                  </DropdownMenuItem>
                  {message.status !== 'replied' && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onReply(message);
                    }}>
                      <Mail className="mr-2 h-4 w-4" /> Responder
                    </DropdownMenuItem>
                  )}
                  {message.status === 'unread' && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(message.id, 'read');
                    }}>
                      <Check className="mr-2 h-4 w-4" /> Marcar como lida
                    </DropdownMenuItem>
                  )}
                  {message.status !== 'unread' && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(message.id, 'unread');
                    }}>
                      Marcar como não lida
                    </DropdownMenuItem>
                  )}
                  {message.status !== 'archived' && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(message.id, 'archived');
                    }}>
                      Arquivar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(message.id);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminMessages;
