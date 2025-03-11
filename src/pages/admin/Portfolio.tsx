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
  Plus, ArrowUpDown, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortfolioItem } from '@/types';

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'E-commerce Moda Sustentável',
    description: 'Desenvolvimento de uma plataforma completa de e-commerce focada em moda sustentável, com sistema de pagamento integrado e gerenciamento de estoque.',
    category: 'e-commerce',
    client: 'EcoFashion Brasil',
    completed: new Date('2023-02-15'),
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    featured: true,
    featuredImage: '/portfolio/ecommerce1.jpg',
    images: ['/portfolio/ecommerce1.jpg', '/portfolio/ecommerce2.jpg'],
    link: 'https://ecofashion.com.br'
  },
  {
    id: '2',
    title: 'Aplicativo de Gestão Financeira',
    description: 'Aplicativo móvel para controle financeiro pessoal com importação de extratos bancários, categorização automatizada e relatórios personalizados.',
    category: 'mobile-app',
    client: 'FinControl',
    completed: new Date('2023-04-10'),
    technologies: ['React Native', 'Firebase', 'Cloud Functions'],
    featured: true,
    featuredImage: '/portfolio/finapp1.jpg',
    images: ['/portfolio/finapp1.jpg', '/portfolio/finapp2.jpg'],
    link: 'https://fincontrol.app'
  },
  {
    id: '3',
    title: 'Sistema de Gestão para Clínicas',
    description: 'Sistema completo para gerenciamento de clínicas médicas, com agendamento online, prontuário eletrônico e faturamento.',
    category: 'web-app',
    client: 'MedSys',
    completed: new Date('2022-11-20'),
    technologies: ['Angular', 'ASP.NET Core', 'SQL Server'],
    featured: false,
    images: ['/portfolio/clinic1.jpg', '/portfolio/clinic2.jpg']
  },
  {
    id: '4',
    title: 'Website Institucional Responsivo',
    description: 'Desenvolvimento de website institucional responsivo com blog integrado e sistema de newsletter.',
    category: 'website',
    client: 'Arquitetura Moderna',
    completed: new Date('2023-01-05'),
    technologies: ['WordPress', 'PHP', 'MySQL', 'JavaScript'],
    featured: false,
    images: ['/portfolio/arq1.jpg', '/portfolio/arq2.jpg'],
    link: 'https://arquiteturamoderna.com.br'
  },
  {
    id: '5',
    title: 'Dashboard Analítico',
    description: 'Dashboard interativo para visualização de dados de vendas e marketing, com gráficos personalizados e exportação de relatórios.',
    category: 'web-app',
    client: 'DataViz Corp',
    completed: new Date('2022-12-12'),
    technologies: ['Vue.js', 'Express', 'PostgreSQL', 'D3.js'],
    featured: true,
    featuredImage: '/portfolio/dashboard1.jpg',
    images: ['/portfolio/dashboard1.jpg', '/portfolio/dashboard2.jpg']
  }
];

const categoryOptions = [
  { value: 'website', label: 'Website' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'web-app', label: 'Aplicação Web' },
  { value: 'mobile-app', label: 'Aplicativo Móvel' },
  { value: 'desktop-app', label: 'Aplicativo Desktop' },
  { value: 'integration', label: 'Integração' },
  { value: 'ai-solution', label: 'Soluç��o IA' },
  { value: 'other', label: 'Outro' }
];

const AdminPortfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(mockPortfolioItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [newTech, setNewTech] = useState('');

  const handleToggleFeatured = (id: string) => {
    setPortfolioItems(portfolioItems.map(item => 
      item.id === id ? { ...item, featured: !item.featured } : item
    ));
    toast.success('Status de destaque atualizado.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item do portfólio?')) {
      setPortfolioItems(portfolioItems.filter(item => item.id !== id));
      toast.success('Item removido do portfólio.');
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const openCreateModal = () => {
    const newItem: PortfolioItem = {
      id: `portfolio-${Date.now()}`,
      title: '',
      description: '',
      category: 'website',
      client: '',
      completed: new Date(),
      technologies: [],
      featured: false,
      images: []
    };
    setCurrentItem(newItem);
    setShowProjectModal(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setCurrentItem({...item});
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

  const handleAddImageUrl = () => {
    if (currentItem) {
      const mockImageUrl = `/portfolio/image-${Date.now()}.jpg`;
      
      setCurrentItem({
        ...currentItem,
        images: [...currentItem.images, mockImageUrl],
        featuredImage: currentItem.featuredImage || mockImageUrl
      });
      
      toast.success('Imagem adicionada.');
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
    
    if (!currentItem.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    
    if (!currentItem.client.trim()) {
      toast.error('O nome do cliente é obrigatório');
      return;
    }

    if (currentItem.id.startsWith('portfolio-')) {
      setPortfolioItems([...portfolioItems, currentItem]);
      toast.success('Novo projeto adicionado ao portfólio');
    } else {
      setPortfolioItems(portfolioItems.map(item => 
        item.id === currentItem.id ? currentItem : item
      ));
      toast.success('Projeto atualizado com sucesso');
    }
    
    setShowProjectModal(false);
    setCurrentItem(null);
  };

  const filteredAndSortedItems = portfolioItems
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.completed.getTime() - b.completed.getTime();
      } else {
        return b.completed.getTime() - a.completed.getTime();
      }
    });

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
                    <span>Concluído em {item.completed.toLocaleDateString('pt-BR')}</span>
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
                    <Button size="sm" variant="outline" asChild>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Visitar
                        </a>
                      ) : (
                        <span>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Visualizar
                        </span>
                      )}
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
              <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
            </div>
          )}
        </div>

        {

