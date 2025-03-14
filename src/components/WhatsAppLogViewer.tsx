
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  FileDown, 
  Clock,
  MessageSquare,
  Globe,
  Shield,
  Key,
  Phone
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getLogHistory, clearLogHistory } from "@/lib/whatsgwService";

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

const WhatsAppLogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const loadLogs = () => {
    const logHistory = getLogHistory();
    setLogs(logHistory);
  };
  
  useEffect(() => {
    loadLogs();
  }, []);
  
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        loadLogs();
      }, 3000);
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);
  
  const handleClearLogs = () => {
    clearLogHistory();
    loadLogs();
    toast.success("Logs limpos com sucesso");
  };
  
  const handleExportLogs = () => {
    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `whatsapp-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Logs exportados com sucesso");
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Erro ao exportar logs");
    }
  };
  
  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    return true;
  });
  
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const getLogIcon = (type: 'info' | 'error' | 'warning') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'send-message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'api-connection':
      case 'api-request':
        return <Globe className="h-4 w-4 text-blue-400" />;
      case 'configuration':
        return <Key className="h-4 w-4 text-purple-500" />;
      case 'format-phone':
        return <Phone className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getLogItemClass = (type: 'info' | 'error' | 'warning') => {
    switch (type) {
      case 'error':
        return "border-l-4 border-l-destructive bg-destructive/10";
      case 'warning':
        return "border-l-4 border-l-amber-500 bg-amber-500/10";
      case 'info':
      default:
        return "border-l-4 border-l-blue-500 bg-blue-500/10";
    }
  };
  
  const isApiError = (log: LogEntry): boolean => {
    if (log.type !== 'error') return false;
    
    const message = log.message?.toLowerCase() || '';
    const details = typeof log.details === 'object' ? 
                    JSON.stringify(log.details).toLowerCase() : 
                    String(log.details).toLowerCase();
                    
    return message.includes('api') || 
           details.includes('api') || 
           message.includes('failed to fetch') ||
           details.includes('failed to fetch');
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Logs de WhatsApp</CardTitle>
            <CardDescription>
              Histórico de operações e erros do serviço de WhatsApp
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadLogs()}
              title="Atualizar logs"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={autoRefresh ? "bg-primary/20" : ""}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? "Desativar atualização automática" : "Ativar atualização automática"}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportLogs}
              title="Exportar logs"
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearLogs}
              title="Limpar logs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-2">
            <select 
              className="border rounded p-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">Todos os logs</option>
              <option value="error">Apenas erros</option>
              <option value="warning">Apenas avisos</option>
              <option value="info">Apenas informações</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          {filteredLogs.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md ${getLogItemClass(log.type)}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {getLogIcon(log.type)}
                      <div className="flex items-center gap-1">
                        {getOperationIcon(log.operation)}
                        <span className="font-medium">
                          {log.operation}
                        </span>
                      </div>
                      <Badge 
                        variant={log.type === 'error' ? 'destructive' : log.type === 'warning' ? 'outline' : 'secondary'}
                        className="ml-2"
                      >
                        {log.type.toUpperCase()}
                      </Badge>
                      {isApiError(log) && (
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-300">
                          <Shield className="h-3 w-3 mr-1" /> API
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  
                  <p className="ml-6 text-sm">{log.message}</p>
                  
                  {log.details && (
                    <pre className="ml-6 mt-2 p-2 bg-secondary/50 rounded text-xs whitespace-pre-wrap overflow-auto max-h-[100px]">
                      {typeof log.details === 'object' 
                        ? JSON.stringify(log.details, null, 2) 
                        : String(log.details)
                      }
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
              <Info className="h-12 w-12 mb-2 opacity-20" />
              <p>Nenhum log encontrado</p>
              <p className="text-sm">
                {filter !== 'all' 
                  ? `Não há registros com o filtro atual. Tente mudar o filtro.` 
                  : 'Os logs aparecerão aqui conforme as operações de WhatsApp forem executadas.'}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WhatsAppLogViewer;
