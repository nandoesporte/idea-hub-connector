
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PencilIcon, Plus, Trash, Link as LinkIcon } from 'lucide-react';

// Define types for our categories
interface CategoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  type: 'tech' | 'insurance';
  iconColor: string;
}

// Sample data - in a real app this would come from a database
const initialTechCategories: CategoryItem[] = [
  {
    id: '1',
    title: 'Desenvolvimento Web',
    description: 'Sites, aplicações e portais personalizados',
    icon: 'Cpu',
    link: '/submit-idea',
    type: 'tech',
    iconColor: 'text-blue-500'
  },
  {
    id: '2',
    title: 'Apps Móveis',
    description: 'Aplicativos para iOS e Android',
    icon: 'Code',
    link: '/submit-idea',
    type: 'tech',
    iconColor: 'text-purple-500'
  },
  {
    id: '3',
    title: 'Sistemas de Gestão',
    description: 'ERPs e sistemas administrativos',
    icon: 'Database',
    link: '/submit-idea',
    type: 'tech',
    iconColor: 'text-green-500'
  },
  {
    id: '4',
    title: 'Soluções com IA',
    description: 'Inteligência artificial para seu negócio',
    icon: 'BrainCircuit',
    link: '/submit-idea',
    type: 'tech',
    iconColor: 'text-amber-500'
  }
];

const initialInsuranceCategories: CategoryItem[] = [
  {
    id: '5',
    title: 'Seguro de Vida',
    description: 'Proteção financeira para você e sua família',
    icon: 'Heart',
    link: '/submit-idea',
    type: 'insurance',
    iconColor: 'text-pink-500'
  },
  {
    id: '6',
    title: 'Seguro Residencial',
    description: 'Proteção completa para seu lar',
    icon: 'Home',
    link: '/submit-idea',
    type: 'insurance',
    iconColor: 'text-blue-500'
  },
  {
    id: '7',
    title: 'Seguro Empresarial',
    description: 'Soluções para proteger seu negócio',
    icon: 'Briefcase',
    link: '/submit-idea',
    type: 'insurance',
    iconColor: 'text-purple-500'
  },
  {
    id: '8',
    title: 'Seguro Saúde',
    description: 'Cuidados médicos para você e sua família',
    icon: 'Hospital',
    link: '/submit-idea',
    type: 'insurance',
    iconColor: 'text-green-500'
  }
];

// Form schema for category validation
const categoryFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  icon: z.string().min(1, { message: 'Selecione um ícone' }),
  link: z.string().url({ message: 'Insira uma URL válida (inclua http:// ou https://)' }),
  type: z.enum(['tech', 'insurance']),
  iconColor: z.string().min(1, { message: 'Selecione uma cor' })
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Available icons for selection
const availableIcons = [
  { value: 'Cpu', label: 'CPU (Desenvolvimento Web)' },
  { value: 'Code', label: 'Código (Apps Móveis)' },
  { value: 'Database', label: 'Banco de Dados (Sistemas de Gestão)' },
  { value: 'BrainCircuit', label: 'IA (Soluções com IA)' },
  { value: 'Heart', label: 'Coração (Seguro de Vida)' },
  { value: 'Home', label: 'Casa (Seguro Residencial)' },
  { value: 'Briefcase', label: 'Maleta (Seguro Empresarial)' },
  { value: 'Hospital', label: 'Hospital (Seguro Saúde)' },
  { value: 'Shield', label: 'Escudo (Seguro Geral)' },
  { value: 'Server', label: 'Servidor (Cloud)' },
  { value: 'FileText', label: 'Documento (Documentação)' },
  { value: 'Zap', label: 'Raio (Rápido)' }
];

// Available colors for selection
const availableColors = [
  { value: 'text-blue-500', label: 'Azul' },
  { value: 'text-purple-500', label: 'Roxo' },
  { value: 'text-green-500', label: 'Verde' },
  { value: 'text-amber-500', label: 'Âmbar' },
  { value: 'text-pink-500', label: 'Rosa' },
  { value: 'text-red-500', label: 'Vermelho' },
  { value: 'text-indigo-500', label: 'Índigo' },
  { value: 'text-teal-500', label: 'Turquesa' }
];

const Categories = () => {
  const [techCategories, setTechCategories] = useState<CategoryItem[]>(initialTechCategories);
  const [insuranceCategories, setInsuranceCategories] = useState<CategoryItem[]>(initialInsuranceCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'tech' | 'insurance'>('tech');

  // Initialize the form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      link: '',
      type: 'tech',
      iconColor: ''
    }
  });

  // Function to add a new category
  const handleAddCategory = (values: CategoryFormValues) => {
    const newCategory: CategoryItem = {
      id: values.id || Date.now().toString(),
      title: values.title,
      description: values.description,
      icon: values.icon,
      link: values.link,
      type: values.type,
      iconColor: values.iconColor
    };

    if (values.id) {
      // Edit existing category
      if (values.type === 'tech') {
        setTechCategories(techCategories.map(cat => 
          cat.id === values.id ? newCategory : cat
        ));
      } else {
        setInsuranceCategories(insuranceCategories.map(cat => 
          cat.id === values.id ? newCategory : cat
        ));
      }
      toast.success('Categoria atualizada com sucesso!');
    } else {
      // Add new category
      if (values.type === 'tech') {
        setTechCategories([...techCategories, newCategory]);
      } else {
        setInsuranceCategories([...insuranceCategories, newCategory]);
      }
      toast.success('Nova categoria adicionada!');
    }
    
    setIsDialogOpen(false);
    form.reset();
  };

  // Function to delete a category
  const handleDeleteCategory = (id: string, type: 'tech' | 'insurance') => {
    if (type === 'tech') {
      setTechCategories(techCategories.filter(cat => cat.id !== id));
    } else {
      setInsuranceCategories(insuranceCategories.filter(cat => cat.id !== id));
    }
    toast.success('Categoria removida com sucesso!');
  };

  // Function to edit a category
  const handleEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);
    form.reset(category);
    setIsDialogOpen(true);
  };

  // Set up new category
  const handleNewCategory = (type: 'tech' | 'insurance') => {
    setEditingCategory(null);
    form.reset({
      title: '',
      description: '',
      icon: '',
      link: '',
      type,
      iconColor: ''
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout
      title="Gerenciar Categorias"
      description="Edite, adicione ou remova categorias de tecnologia e seguros."
      actionLabel="Nova Categoria"
      onAction={() => handleNewCategory(activeTab)}
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tech' | 'insurance')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tech">Soluções Tecnológicas</TabsTrigger>
          <TabsTrigger value="insurance">Seguros Disponíveis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Soluções Tecnológicas</CardTitle>
                  <CardDescription>Categorias exibidas na seção de tecnologia do painel do usuário</CardDescription>
                </div>
                <Button onClick={() => handleNewCategory('tech')} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Nova Categoria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ícone</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {techCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{category.description}</TableCell>
                      <TableCell>{category.icon}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{category.link}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditCategory(category)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" 
                          onClick={() => handleDeleteCategory(category.id, 'tech')}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Seguros Disponíveis</CardTitle>
                  <CardDescription>Categorias exibidas na seção de seguros do painel do usuário</CardDescription>
                </div>
                <Button onClick={() => handleNewCategory('insurance')} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Nova Categoria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ícone</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insuranceCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{category.description}</TableCell>
                      <TableCell>{category.icon}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{category.link}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditCategory(category)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" 
                          onClick={() => handleDeleteCategory(category.id, 'insurance')}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Form Dialog for adding/editing categories */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Atualize os detalhes da categoria existente.' 
                : 'Preencha os detalhes da nova categoria.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddCategory)} className="space-y-4">
              {/* Hidden ID field for edits */}
              <input type="hidden" {...form.register('id')} />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Categoria</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tech">Solução Tecnológica</SelectItem>
                        <SelectItem value="insurance">Seguro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Breve descrição da categoria" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícone</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ícone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="iconColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do Ícone</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma cor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableColors.map((color) => (
                            <SelectItem key={color.value} value={color.value} className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 ${color.value.replace('text-', 'bg-')}`}></div>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <Input 
                          placeholder="https://example.com/page" 
                          {...field} 
                          className="rounded-l-none"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Use URLs completas, incluindo http:// ou https://
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Salvar Alterações' : 'Adicionar Categoria'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Categories;
