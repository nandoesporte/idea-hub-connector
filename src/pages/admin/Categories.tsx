import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, MoreHorizontal, Edit, Trash, 
  ArrowUpDown, Copy, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CategoryItem } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCategories, createCategory, updateCategory, deleteCategory 
} from '@/lib/categoryService';

const AdminCategories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState({
    title: '',
    description: '',
    icon: '',
    link: '',
    iconColor: '#000000'
  });
  const [categoryState, setCategoryState] = useState<CategoryItem>({
    id: '',
    title: '',
    description: '',
    icon: '',
    link: '',
    type: 'tech',
    iconColor: '',
    order: 0
  });

  const initialCategory: CategoryItem = {
    id: '',
    title: '',
    description: '',
    icon: 'sparkles',
    iconColor: 'text-primary',
    link: '',
    type: 'tech',
    enabled: true,
    order: 0
  };

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar categoria: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (params: {id: string, category: Partial<Omit<CategoryItem, "id">>}) => 
      updateCategory(params.id, params.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar categoria: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover categoria: ${error.message}`);
    }
  });

  const handleToggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleEditCategory = (category: CategoryItem) => {
    setCategoryState(category);
  };

  const handleUpdateCategory = async () => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({
        id: categoryState.id,
        category: {
          title: categoryState.title,
          description: categoryState.description,
          icon: categoryState.icon,
          link: categoryState.link,
          type: categoryState.type,
          iconColor: categoryState.iconColor,
          order: categoryState.order
        }
      });
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Categoria excluída com sucesso!');
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        toast.error("Erro ao excluir categoria");
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.title || !newCategory.description || !newCategory.icon) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsSubmitting(true);
      await addMutation.mutateAsync({
        title: newCategory.title,
        description: newCategory.description,
        icon: newCategory.icon,
        link: newCategory.link || "",
        type: "tech",
        iconColor: newCategory.iconColor || "#000000",
        order: Array.isArray(categories) ? categories.length + 1 : 1
      });

      setShowAddDialog(false);
      resetNewCategory();
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast.error("Erro ao adicionar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewCategory = () => {
    setNewCategory({
      title: '',
      description: '',
      icon: '',
      link: '',
      iconColor: '#000000'
    });
  };

  const filteredCategories = Array.isArray(categories) ? categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  }) : [];

  const handleResetForm = () => {
    setCategoryState({
      id: categoryState.id,
      link: categoryState.link,
      title: categoryState.title,
      icon: categoryState.icon,
      description: categoryState.description,
      iconColor: categoryState.iconColor,
      type: categoryState.type,
      order: categoryState.order
    });
  };

  return (
    <AdminLayout
      title="Gerenciamento de Categorias"
      description="Adicione e gerencie as categorias de serviços."
      actionLabel="Nova Categoria"
      onAction={() => setShowAddDialog(true)}
    >
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou descrição..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleToggleSortOrder} title="Ordenar por nome">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando categorias...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar categorias: {(error as Error).message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={category.icon} alt={category.title} />
                        <AvatarFallback>{category.title.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {category.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            if (category.link) {
                                navigator.clipboard.writeText(category.link);
                                toast.success('Link copiado para a área de transferência!');
                            } else {
                                toast.message('Esta categoria não possui um link definido.');
                            }
                        }}>
                          <Copy className="h-4 w-4 mr-2" /> Copiar Link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhuma categoria encontrada. Clique em "Nova Categoria" para adicionar.</p>
              </div>
            )}
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma nova categoria de serviço.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Desenvolvimento Web"
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da categoria"
                  className="resize-none"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Ícone (URL)</Label>
                <Input
                  id="icon"
                  placeholder="URL do ícone"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Link (opcional)</Label>
                <Input
                  id="link"
                  placeholder="URL de destino"
                  value={newCategory.link}
                  onChange={(e) => setNewCategory({ ...newCategory, link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iconColor">Cor do Ícone</Label>
                <Input
                  type="color"
                  id="iconColor"
                  value={newCategory.iconColor}
                  onChange={(e) => setNewCategory({ ...newCategory, iconColor: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleAddCategory} disabled={isSubmitting}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!categoryState.id} onOpenChange={() => setCategoryState({ ...categoryState, id: '' })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Edite os detalhes da categoria selecionada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Desenvolvimento Web"
                  value={categoryState.title}
                  onChange={(e) => setCategoryState({ ...categoryState, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da categoria"
                  className="resize-none"
                  value={categoryState.description}
                  onChange={(e) => setCategoryState({ ...categoryState, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Ícone (URL)</Label>
                <Input
                  id="icon"
                  placeholder="URL do ícone"
                  value={categoryState.icon}
                  onChange={(e) => setCategoryState({ ...categoryState, icon: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Link (opcional)</Label>
                <Input
                  id="link"
                  placeholder="URL de destino"
                  value={categoryState.link}
                  onChange={(e) => setCategoryState({ ...categoryState, link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iconColor">Cor do Ícone</Label>
                <Input
                  type="color"
                  id="iconColor"
                  value={categoryState.iconColor || '#000000'}
                  onChange={(e) => setCategoryState({ ...categoryState, iconColor: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleResetForm}>
                Resetar
              </Button>
              <Button type="button" variant="outline" onClick={() => setCategoryState({ ...categoryState, id: '' })}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleUpdateCategory} disabled={isSubmitting}>
                {isSubmitting ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
