
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  getReceivedMessages, 
  startMessagePolling, 
  isWhatsAppConfigured,
  sendWhatsAppMessage,
  ReceivedMessage 
} from "@/lib/whatsgwService";
import { MessageSquare, Phone, Clock, RefreshCw, Send, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const WhatsAppMessages = () => {
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);
  const [replyTo, setReplyTo] = useState<ReceivedMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    if (!isWhatsAppConfigured()) {
      toast.error("WhatsApp não configurado");
      return;
    }

    setLoading(true);
    try {
      const receivedMessages = await getReceivedMessages(50);
      setMessages(receivedMessages);
      toast.success(`${receivedMessages.length} mensagens carregadas`);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  const togglePolling = () => {
    if (polling && stopPolling) {
      stopPolling();
      setStopPolling(null);
      setPolling(false);
      toast.info("Monitoramento de mensagens parado");
    } else {
      const stopFn = startMessagePolling((newMessage) => {
        setMessages(prev => [newMessage, ...prev]);
        toast.success(`Nova mensagem de ${newMessage.phone}`);
      });
      setStopPolling(() => stopFn);
      setPolling(true);
      toast.success("Monitoramento de mensagens iniciado");
    }
  };

  const handleReply = async () => {
    if (!replyTo || !replyMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      const success = await sendWhatsAppMessage({
        phone: replyTo.phone,
        message: replyMessage,
        customId: `reply_${Date.now()}`
      });

      if (success) {
        setReplyMessage('');
        setReplyTo(null);
        toast.success("Resposta enviada com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao enviar resposta");
    } finally {
      setSending(false);
    }
  };

  const formatMessageType = (type: string) => {
    const typeMap = {
      'text': 'Texto',
      'image': 'Imagem',
      'document': 'Documento',
      'audio': 'Áudio',
      'video': 'Vídeo'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith('55')) {
      const withoutCountry = phone.substring(2);
      if (withoutCountry.length === 11) {
        return `(${withoutCountry.substring(0, 2)}) ${withoutCountry.substring(2, 7)}-${withoutCountry.substring(7)}`;
      }
    }
    return phone;
  };

  useEffect(() => {
    if (isWhatsAppConfigured()) {
      loadMessages();
    }

    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, []);

  if (!isWhatsAppConfigured()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Configure a chave de API do WhatsApp nas configurações para visualizar e gerenciar mensagens.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens WhatsApp Recebidas
          </CardTitle>
          <CardDescription>
            Visualize e responda mensagens recebidas via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={loadMessages} 
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </>
              )}
            </Button>
            
            <Button 
              onClick={togglePolling}
              variant={polling ? "destructive" : "default"}
            >
              {polling ? (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Parar Monitoramento
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Iniciar Monitoramento
                </>
              )}
            </Button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem encontrada</p>
              <p className="text-sm">Clique em "Atualizar" para verificar novas mensagens</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{formatPhone(message.phone)}</span>
                          <Badge variant="secondary">
                            {formatMessageType(message.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {message.timestamp.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      </div>

                      {message.mediaUrl && (
                        <div className="mb-3">
                          <a 
                            href={message.mediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {message.fileName || 'Ver mídia'}
                          </a>
                        </div>
                      )}

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setReplyTo(message)}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Responder
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {replyTo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">
              Responder para {formatPhone(replyTo.phone)}
            </CardTitle>
            <CardDescription>
              Respondendo à mensagem: "{replyTo.message.substring(0, 50)}..."
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Digite sua resposta..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleReply}
                disabled={!replyMessage.trim() || sending}
              >
                {sending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Resposta
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setReplyTo(null);
                  setReplyMessage('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppMessages;
