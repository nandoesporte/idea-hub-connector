
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
  Filter 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getLogHistory, clearLogHistory } from "@/lib/whatsappService";

// Define log entry interface to match the one in whatsappService
interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

const WhatsAppLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Function to load logs
  const loadLogs = () => {
    const logHistory = getLogHistory();
    setLogs(logHistory);
  };
  
  // Load logs on component mount
  useEffect(() => {
    loadLogs();
  }, []);
  
  // Set up auto-refresh if enabled
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        loadLogs();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);
  
  // Handle clearing logs
  const handleClearLogs = () => {
    clearLogHistory();
    loadLogs();
    toast.success("Logs limpos com sucesso");
  };
  
  // Export logs as JSON file
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
  
  // Filter logs based on current filter
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });
  
  // Helper to format timestamp
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
  
  // Helper to get icon for log type
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
  
  // Helper to get class for log type
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
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Tabs defaultValue="all" className="w-[400px]" onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="error" className="text-destructive">Erros</TabsTrigger>
              <TabsTrigger value="warning" className="text-amber-500">Avisos</TabsTrigger>
              <TabsTrigger value="info" className="text-blue-500">Info</TabsTrigger>
            </TabsList>
          </Tabs>
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
                      <span className="font-medium">
                        {log.operation}
                      </span>
                      <Badge 
                        variant={log.type === 'error' ? 'destructive' : log.type === 'warning' ? 'outline' : 'secondary'}
                        className="ml-2"
                      >
                        {log.type.toUpperCase()}
                      </Badge>
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
                  ? `Não há registros do tipo ${filter.toUpperCase()}. Tente mudar o filtro.` 
                  : 'Os logs aparecerão aqui conforme as operações de WhatsApp forem executadas.'}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WhatsAppLogs;
