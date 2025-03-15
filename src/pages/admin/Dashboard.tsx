
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ReloadIcon, PlusIcon, Cross2Icon, GripVerticalIcon, CopyIcon, ResetIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { 
  getDashboardConfig, 
  updateDashboardConfig, 
  updateDashboardComponent, 
  resetDashboardConfig 
} from '@/lib/dashboardService';
import { DashboardComponent, DashboardConfig, DashboardItem } from '@/types/dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminDashboard = () => {
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({ components: [], lastUpdated: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardConfig();
  }, []);

  const loadDashboardConfig = () => {
    setLoading(true);
    try {
      const config = getDashboardConfig();
      setDashboardConfig(config);
    } catch (error) {
      console.error('Error loading dashboard config:', error);
      toast.error('Erro ao carregar configuração do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(dashboardConfig.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property based on new position
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    const updatedConfig = {
      ...dashboardConfig,
      components: updatedItems
    };
    
    setDashboardConfig(updatedConfig);
    updateDashboardConfig(updatedConfig);
    toast.success('Ordem dos componentes atualizada');
  };

  const toggleComponentEnabled = (componentId: string, enabled: boolean) => {
    try {
      const updatedConfig = {
        ...dashboardConfig,
        components: dashboardConfig.components.map(comp => 
          comp.id === componentId ? { ...comp, enabled } : comp
        )
      };
      
      setDashboardConfig(updatedConfig);
      updateDashboardConfig(updatedConfig);
      toast.success(`Componente ${enabled ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Error toggling component:', error);
      toast.error('Erro ao atualizar componente');
    }
  };

  const toggleItemEnabled = (componentId: string, itemId: string, enabled: boolean) => {
    try {
      const updatedConfig = {
        ...dashboardConfig,
        components: dashboardConfig.components.map(comp => {
          if (comp.id !== componentId || !comp.items) return comp;
          
          return {
            ...comp,
            items: comp.items.map(item => 
              item.id === itemId ? { ...item, enabled } : item
            )
          };
        })
      };
      
      setDashboardConfig(updatedConfig);
      updateDashboardConfig(updatedConfig);
      toast.success(`Item ${enabled ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const updateComponentSize = (componentId: string, size: 'small' | 'medium' | 'large' | 'full') => {
    try {
      const updatedConfig = {
        ...dashboardConfig,
        components: dashboardConfig.components.map(comp => 
          comp.id === componentId ? { ...comp, size } : comp
        )
      };
      
      setDashboardConfig(updatedConfig);
      updateDashboardConfig(updatedConfig);
      toast.success('Tamanho do componente atualizado');
    } catch (error) {
      console.error('Error updating component size:', error);
      toast.error('Erro ao atualizar tamanho do componente');
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Tem certeza que deseja resetar a configuração do dashboard para o padrão? Esta ação não pode ser desfeita.')) {
      try {
        const defaultConfig = resetDashboardConfig();
        setDashboardConfig(defaultConfig);
        toast.success('Configuração do dashboard resetada com sucesso');
      } catch (error) {
        console.error('Error resetting dashboard config:', error);
        toast.error('Erro ao resetar configuração do dashboard');
      }
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'insurance':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Seguros</Badge>;
      case 'tech':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/20">Tecnologia</Badge>;
      case 'action':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Ações</Badge>;
      case 'quote':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Cotações</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Data desconhecida';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gerenciamento do Dashboard">
        <div className="flex items-center justify-center h-64">
          <ReloadIcon className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando configuração...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gerenciamento do Dashboard" 
      description="Configure os componentes exibidos no dashboard do usuário"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-lg">
          <div>
            <h2 className="text-lg font-medium">Configuração do Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Última atualização: {formatLastUpdated(dashboardConfig.lastUpdated)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDashboardConfig} variant="outline" size="sm">
              <ReloadIcon className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
            <Button onClick={handleResetConfig} variant="destructive" size="sm">
              <ResetIcon className="mr-2 h-4 w-4" />
              Resetar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="layout">Layout & Ordem</TabsTrigger>
            <TabsTrigger value="components">Componentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Organização do Dashboard</CardTitle>
                <CardDescription>
                  Arraste os componentes para reordenar ou altere suas configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="dashboard-components">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {dashboardConfig.components
                          .sort((a, b) => a.order - b.order)
                          .map((component, index) => (
                            <Draggable
                              key={component.id}
                              draggableId={component.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`border rounded-lg p-4 ${!component.enabled ? 'opacity-60 bg-muted/30' : 'bg-card'}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div {...provided.dragHandleProps} className="cursor-grab mt-1">
                                        <GripVerticalIcon className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium">{component.title}</h3>
                                          {getTypeBadge(component.type)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {component.description || 'Sem descrição'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-2">
                                        <Select
                                          value={component.size || 'medium'}
                                          onValueChange={(value) => 
                                            updateComponentSize(
                                              component.id, 
                                              value as 'small' | 'medium' | 'large' | 'full'
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-[120px] h-8">
                                            <SelectValue placeholder="Tamanho" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="small">Pequeno</SelectItem>
                                            <SelectItem value="medium">Médio</SelectItem>
                                            <SelectItem value="large">Grande</SelectItem>
                                            <SelectItem value="full">Completo</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`${component.id}-toggle`}
                                          checked={component.enabled}
                                          onCheckedChange={(checked) => 
                                            toggleComponentEnabled(component.id, checked)
                                          }
                                        />
                                        <Label htmlFor={`${component.id}-toggle`}>
                                          {component.enabled ? 'Ativo' : 'Inativo'}
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {component.items && component.items.length > 0 && (
                                    <>
                                      <Separator className="my-4" />
                                      <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Itens ({component.items.length})</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {component.items.map((item) => (
                                            <div 
                                              key={item.id}
                                              className={`border rounded-md p-3 ${!item.enabled ? 'opacity-60 bg-muted/30' : ''}`}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <div className="font-medium text-sm">{item.title}</div>
                                                  <div className="text-xs text-muted-foreground mt-1">
                                                    {item.description || 'Sem descrição'}
                                                  </div>
                                                  <div className="text-xs text-primary mt-1">
                                                    Link: {item.link}
                                                  </div>
                                                </div>
                                                <div className="flex items-center">
                                                  <Switch
                                                    id={`${component.id}-${item.id}-toggle`}
                                                    checked={item.enabled}
                                                    onCheckedChange={(checked) => 
                                                      toggleItemEnabled(component.id, item.id, checked)
                                                    }
                                                    className="scale-75"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="components" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes dos Componentes</CardTitle>
                <CardDescription>
                  Edite e configure cada componente individualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {dashboardConfig.components
                      .sort((a, b) => a.order - b.order)
                      .map((component) => (
                        <div key={component.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{component.title}</h3>
                              {getTypeBadge(component.type)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`component-${component.id}-toggle`}
                                checked={component.enabled}
                                onCheckedChange={(checked) => 
                                  toggleComponentEnabled(component.id, checked)
                                }
                              />
                              <Label htmlFor={`component-${component.id}-toggle`}>
                                {component.enabled ? 'Ativo' : 'Inativo'}
                              </Label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label htmlFor={`title-${component.id}`}>Título</Label>
                              <Input
                                id={`title-${component.id}`}
                                value={component.title}
                                onChange={(e) => {
                                  const updatedConfig = {
                                    ...dashboardConfig,
                                    components: dashboardConfig.components.map(comp => 
                                      comp.id === component.id ? { ...comp, title: e.target.value } : comp
                                    )
                                  };
                                  setDashboardConfig(updatedConfig);
                                }}
                                onBlur={() => {
                                  updateDashboardConfig(dashboardConfig);
                                  toast.success('Título atualizado');
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`description-${component.id}`}>Descrição</Label>
                              <Input
                                id={`description-${component.id}`}
                                value={component.description || ''}
                                onChange={(e) => {
                                  const updatedConfig = {
                                    ...dashboardConfig,
                                    components: dashboardConfig.components.map(comp => 
                                      comp.id === component.id ? { ...comp, description: e.target.value } : comp
                                    )
                                  };
                                  setDashboardConfig(updatedConfig);
                                }}
                                onBlur={() => {
                                  updateDashboardConfig(dashboardConfig);
                                  toast.success('Descrição atualizada');
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`size-${component.id}`}>Tamanho</Label>
                              <Select
                                value={component.size || 'medium'}
                                onValueChange={(value) => {
                                  const updatedConfig = {
                                    ...dashboardConfig,
                                    components: dashboardConfig.components.map(comp => 
                                      comp.id === component.id ? { 
                                        ...comp, 
                                        size: value as 'small' | 'medium' | 'large' | 'full' 
                                      } : comp
                                    )
                                  };
                                  setDashboardConfig(updatedConfig);
                                  updateDashboardConfig(updatedConfig);
                                  toast.success('Tamanho atualizado');
                                }}
                              >
                                <SelectTrigger id={`size-${component.id}`}>
                                  <SelectValue placeholder="Selecione o tamanho" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">Pequeno</SelectItem>
                                  <SelectItem value="medium">Médio</SelectItem>
                                  <SelectItem value="large">Grande</SelectItem>
                                  <SelectItem value="full">Completo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`layout-${component.id}`}>Layout</Label>
                              <Select
                                value={component.layout || 'grid'}
                                onValueChange={(value) => {
                                  const updatedConfig = {
                                    ...dashboardConfig,
                                    components: dashboardConfig.components.map(comp => 
                                      comp.id === component.id ? { 
                                        ...comp, 
                                        layout: value as 'grid' | 'list' | 'card'
                                      } : comp
                                    )
                                  };
                                  setDashboardConfig(updatedConfig);
                                  updateDashboardConfig(updatedConfig);
                                  toast.success('Layout atualizado');
                                }}
                              >
                                <SelectTrigger id={`layout-${component.id}`}>
                                  <SelectValue placeholder="Selecione o layout" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grid">Grid</SelectItem>
                                  <SelectItem value="list">Lista</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {component.items && component.items.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-sm font-medium mb-3">Itens</h4>
                              <div className="space-y-3">
                                {component.items.map((item) => (
                                  <div 
                                    key={item.id}
                                    className="border rounded-md p-4"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h5 className="font-medium">{item.title}</h5>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`item-${component.id}-${item.id}-toggle`}
                                          checked={item.enabled}
                                          onCheckedChange={(checked) => {
                                            toggleItemEnabled(component.id, item.id, checked);
                                          }}
                                        />
                                        <Label htmlFor={`item-${component.id}-${item.id}-toggle`}>
                                          {item.enabled ? 'Ativo' : 'Inativo'}
                                        </Label>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`item-title-${item.id}`}>Título</Label>
                                        <Input
                                          id={`item-title-${item.id}`}
                                          value={item.title}
                                          onChange={(e) => {
                                            const updatedConfig = {
                                              ...dashboardConfig,
                                              components: dashboardConfig.components.map(comp => {
                                                if (comp.id !== component.id || !comp.items) return comp;
                                                
                                                return {
                                                  ...comp,
                                                  items: comp.items.map(i => 
                                                    i.id === item.id ? { ...i, title: e.target.value } : i
                                                  )
                                                };
                                              })
                                            };
                                            setDashboardConfig(updatedConfig);
                                          }}
                                          onBlur={() => {
                                            updateDashboardConfig(dashboardConfig);
                                            toast.success('Item atualizado');
                                          }}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`item-link-${item.id}`}>Link</Label>
                                        <Input
                                          id={`item-link-${item.id}`}
                                          value={item.link}
                                          onChange={(e) => {
                                            const updatedConfig = {
                                              ...dashboardConfig,
                                              components: dashboardConfig.components.map(comp => {
                                                if (comp.id !== component.id || !comp.items) return comp;
                                                
                                                return {
                                                  ...comp,
                                                  items: comp.items.map(i => 
                                                    i.id === item.id ? { ...i, link: e.target.value } : i
                                                  )
                                                };
                                              })
                                            };
                                            setDashboardConfig(updatedConfig);
                                          }}
                                          onBlur={() => {
                                            updateDashboardConfig(dashboardConfig);
                                            toast.success('Item atualizado');
                                          }}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`item-icon-${item.id}`}>Ícone</Label>
                                        <Input
                                          id={`item-icon-${item.id}`}
                                          value={item.icon || ''}
                                          onChange={(e) => {
                                            const updatedConfig = {
                                              ...dashboardConfig,
                                              components: dashboardConfig.components.map(comp => {
                                                if (comp.id !== component.id || !comp.items) return comp;
                                                
                                                return {
                                                  ...comp,
                                                  items: comp.items.map(i => 
                                                    i.id === item.id ? { ...i, icon: e.target.value } : i
                                                  )
                                                };
                                              })
                                            };
                                            setDashboardConfig(updatedConfig);
                                          }}
                                          onBlur={() => {
                                            updateDashboardConfig(dashboardConfig);
                                            toast.success('Item atualizado');
                                          }}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`item-description-${item.id}`}>Descrição</Label>
                                        <Input
                                          id={`item-description-${item.id}`}
                                          value={item.description || ''}
                                          onChange={(e) => {
                                            const updatedConfig = {
                                              ...dashboardConfig,
                                              components: dashboardConfig.components.map(comp => {
                                                if (comp.id !== component.id || !comp.items) return comp;
                                                
                                                return {
                                                  ...comp,
                                                  items: comp.items.map(i => 
                                                    i.id === item.id ? { ...i, description: e.target.value } : i
                                                  )
                                                };
                                              })
                                            };
                                            setDashboardConfig(updatedConfig);
                                          }}
                                          onBlur={() => {
                                            updateDashboardConfig(dashboardConfig);
                                            toast.success('Item atualizado');
                                          }}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`item-color-${item.id}`}>Cor</Label>
                                        <Input
                                          id={`item-color-${item.id}`}
                                          value={item.color || ''}
                                          onChange={(e) => {
                                            const updatedConfig = {
                                              ...dashboardConfig,
                                              components: dashboardConfig.components.map(comp => {
                                                if (comp.id !== component.id || !comp.items) return comp;
                                                
                                                return {
                                                  ...comp,
                                                  items: comp.items.map(i => 
                                                    i.id === item.id ? { ...i, color: e.target.value } : i
                                                  )
                                                };
                                              })
                                            };
                                            setDashboardConfig(updatedConfig);
                                          }}
                                          onBlur={() => {
                                            updateDashboardConfig(dashboardConfig);
                                            toast.success('Item atualizado');
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
