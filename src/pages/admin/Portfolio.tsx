
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, MoreHorizontal, Eye, Edit, Trash, 
  ArrowUpDown, ExternalLink, Image as ImageIcon, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortfolioItem } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPortfolioItems, savePortfolioItem, deletePortfolioItem, uploadPortfolioImage } from '@/lib/portfolioService';

const categoryOptions = [
  { value: 'website', label: 'Website' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'web-app', label: 'Aplicação Web' },
  { value: 'mobile-app', label: 'Aplicativo Móvel' },
  { value: 'desktop-app', label: 'Aplicativo Desktop' },
  { value: 'integration', label: 'Integração' },
  { value: 'ai-solution', label: 'Solução IA' },
  { value: 'other', label: 'Outro' }
];

const AdminPortfolio = () => {
  console.log('Rendering AdminPortfolio component');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [newTech, setNewTech] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch portfolio items
  const { data: portfolioItems = [], isLoading, error } = useQuery({
    queryKey: ['portfolioItems'],
    queryFn: getPortfolioItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('Query results:', { isLoading, error, portfolioItemsCount: portfolioItems.length });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: savePortfolioItem,
    onSuccess: () => {
      console.log('Portfolio item saved successfully');
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      setShowProjectModal(false);
      setCurrentItem(null);
      toast.success('Projeto salvo com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error in save mutation:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      toast.success('Projeto removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  });

  const handleToggleFeatured = async (id: string) => {
    const itemToUpdate = portfolioItems.find(item => item.id === id);
    if (itemToUpdate) {
      const updatedItem = { ...itemToUpdate, featured: !itemToUpdate.featured };
      saveMutation.mutate(updatedItem);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item do portfólio?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const openCreateModal = () => {
    console.log('Opening create modal');
    const newItem: PortfolioItem = {
      id: `temp-${Date.now()}`,
      user_id: 'current-user',  // Add this field
      title: '',
      description: '',
      category: 'website',
      client: '',
      completed: new Date(),
      technologies: [],
      featured: false,
      images: [],
      created_at: new Date(),  // Add this field
      updated_at: new Date()   // Add this field
    };
    setCurrentItem(newItem);
    setShowProjectModal(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    console.log('Opening edit modal for item:', item);
    // Ensure completed is a Date object
    const itemWithDate = {
      ...item,
      completed: item.completed instanceof Date 
        ? item.completed 
        : new Date(item.completed)
    };
    setCurrentItem(itemWithDate);
    setShowProjectModal(true);
  };

  const addTechnology = () => {
    if (newTech.trim() && currentItem) {
      if (!currentItem.technologies.includes(newTech.trim())) {
        setCurrentItem({
          ...currentItem, 
          technologies: [...currentItem.technologies, newTech.trim()]
        });
      }
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        technologies: currentItem.technologies.filter(t => t !== tech)
      });
    }
  };

  const handleSetFeaturedImage = (imageUrl: string) => {
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        featuredImage: imageUrl
      });
      toast.success('Imagem de destaque definida.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !currentItem) return;
    
    setUploading(true);
    try {
      const imageUrl = await uploadPortfolioImage(selectedFile, currentItem.id);
      
      setCurrentItem({
        ...currentItem,
        images: [...currentItem.images, imageUrl],
        // If no featured image is set, use this one
        featuredImage: currentItem.featuredImage || imageUrl
      });
      
      setSelectedFile(null);
      toast.success('Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageUrl: string) => {
    if (currentItem) {
      const updatedImages = currentItem.images.filter(img => img !== imageUrl);
      
      const updatedFeaturedImage = 
        currentItem.featuredImage === imageUrl 
          ? (updatedImages.length > 0 ? updatedImages[0] : undefined) 
          : currentItem.featuredImage;
      
      setCurrentItem({
        ...currentItem,
        images: updatedImages,
        featuredImage: updatedFeaturedImage
      });
    }
  };

  const handleSave = () => {
    if (!currentItem) return;
    
    console.log('Attempting to save item:', currentItem);
    
    if (!currentItem.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    
    if (!currentItem.client.trim()) {
      toast.error('O nome do cliente é obrigatório');
      return;
    }

    // Remove the temp- prefix if it's a new item
    const itemToSave = {
      ...currentItem,
      id: currentItem.id.startsWith('temp-') 
        ? undefined  // Let Supabase generate a UUID
        : currentItem.id
    };
    
    console.log('Final item to save:', itemToSave);
    saveMutation.mutate(itemToSave);
  };

  const filteredAndSortedItems = portfolioItems
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = a.completed instanceof Date ? a.completed : new Date(a.completed);
      const dateB = b.completed instanceof Date ? b.completed : new Date(b.completed);
      
      if (sortOrder === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

  // Handle visiting the project URL
  const handleVisitProject = (url: string | undefined) => {
    if (url) {
      // Open the URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Este projeto não possui um link definido.');
    }
  };

  if (error) {
    console.error('Error in query:', error);
  }

  return (
    <AdminLayout
      title="Gerenciamento de Portfólio"
      description="Adicione e gerencie projetos no portfólio da empresa."
      actionLabel="Novo Projeto"
      onAction={openCreateModal}
    >
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, cliente ou tecnologia..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={toggleSortOrder} title="Ordenar por data">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar projetos: {(error as Error).message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => (
                <Card key={item.id} className={item.featured ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      {item.featured && (
                        <Badge className="ml-2">Destaque</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>Cliente: {item.client}</span>
                      <span>•</span>
                      <span>
                        Concluído em {
                          (item.completed instanceof Date 
                            ? item.completed 
                            : new Date(item.completed)
                          ).toLocaleDateString('pt-BR')
                        }
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {item.featuredImage && (
                      <div className="mb-4 relative aspect-video overflow-hidden rounded-md bg-muted">
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-background/70 backdrop-blur-sm">
                            <ImageIcon className="h-3 w-3 mr-1" /> Imagem Destacada
                          </Badge>
                        </div>
                      </div>
                    )}
                    <p className="text-sm line-clamp-2 mb-3">{item.description}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Categoria:</p>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Tecnologias:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between pt-3 border-t">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleVisitProject(item.link)}
                        disabled={!item.link}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Visitar
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(item)}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeatured(item.id)}>
                          {item.featured ? 'Remover destaque' : 'Destacar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhum projeto encontrado. Clique em "Novo Projeto" para adicionar.</p>
              </div>
            )}
          </div>
        )}

        {/* Project Modal */}
        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentItem?.id.startsWith('temp-') ? 'Adicionar Projeto' : 'Editar Projeto'}
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes do projeto para adicionar ao portfólio.
              </DialogDescription>
            </DialogHeader>
            
            {currentItem && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Projeto*</Label>
                  <Input
                    id="title"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
                    placeholder="Ex: E-commerce de Moda Sustentável"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente*</Label>
                  <Input
                    id="client"
                    value={currentItem.client}
                    onChange={(e) => setCurrentItem({...currentItem, client: e.target.value})}
                    placeholder="Ex: EcoFashion Brasil"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={currentItem.description || ''}
                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                    placeholder="Descreva o projeto e seus principais objetivos"
                    className="resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={currentItem.category}
                    onValueChange={(value) => setCurrentItem({...currentItem, category: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="completed">Data de Conclusão</Label>
                  <Input
                    id="completed"
                    type="date"
                    value={currentItem.completed instanceof Date 
                      ? currentItem.completed.toISOString().split('T')[0]
                      : new Date(currentItem.completed).toISOString().split('T')[0]
                    }
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      completed: new Date(e.target.value)
                    })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="link">Link do Projeto (opcional)</Label>
                  <Input
                    id="link"
                    value={currentItem.link || ''}
                    onChange={(e) => setCurrentItem({...currentItem, link: e.target.value})}
                    placeholder="https://exemplo.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Tecnologias</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Ex: React"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechnology();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTechnology}>
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentItem.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 cursor-pointer" onClick={() => removeTechnology(tech)}>
                        {tech} <span className="ml-1 text-xs">✕</span>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Imagens</Label>
                  <div className="flex flex-col gap-4">
                    <div className="border rounded-md p-4">
                      <Label htmlFor="image" className="mb-2 block">Upload de nova imagem</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={handleUploadImage} 
                          disabled={!selectedFile || uploading}
                          className="whitespace-nowrap"
                        >
                          {uploading ? 'Enviando...' : 'Enviar Imagem'}
                          <Upload className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {currentItem.images && currentItem.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {currentItem.images.map((img, index) => (
                        <div 
                          key={index} 
                          className={`relative aspect-video rounded-md overflow-hidden border-2 ${currentItem.featuredImage === img ? 'border-primary' : 'border-transparent'}`}
                        >
                          <img 
                            src={img} 
                            alt={`Imagem ${index + 1}`} 
                            className="object-cover w-full h-full" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {currentItem.featuredImage !== img && (
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-8"
                                onClick={() => handleSetFeaturedImage(img)}
                              >
                                <ImageIcon className="h-3.5 w-3.5 mr-1" /> Definir como destaque
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8"
                              onClick={() => removeImage(img)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {currentItem.featuredImage === img && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-background/70 backdrop-blur-sm">
                                <ImageIcon className="h-3 w-3 mr-1" /> Destaque
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={currentItem.featured}
                      onChange={(e) => setCurrentItem({...currentItem, featured: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="featured">Destacar este projeto no portfólio</Label>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProjectModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPortfolio;
