import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Phone, MessageSquare, Bell, AlertCircle } from 'lucide-react';
import { setApiKey, isWhatsAppConfigured } from '@/lib/whatsappService';
import AdminWhatsAppSettings from '@/components/AdminWhatsAppSettings';
import WhatsAppLogViewer from '@/components/WhatsAppLogViewer';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  features: {
    enableBlog: boolean;
    enableTestimonials: boolean;
    enableContactForm: boolean;
    enableNewsletter: boolean;
    enableUserRegistration: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string;
  };
}

const initialSettings: SiteSettings = {
  siteName: 'IdeaHub Connector',
  siteDescription: 'Conectando ideias a desenvolvedores profissionais',
  contactEmail: 'contato@ideahub.com.br',
  phoneNumber: '(11) 98765-4321',
  address: 'Av. Paulista, 1000, São Paulo - SP',
  socialMedia: {
    facebook: 'https://facebook.com/ideahub',
    instagram: 'https://instagram.com/ideahub',
    twitter: 'https://twitter.com/ideahub',
    linkedin: 'https://linkedin.com/company/ideahub',
  },
  features: {
    enableBlog: true,
    enableTestimonials: true,
    enableContactForm: true,
    enableNewsletter: false,
    enableUserRegistration: true,
  },
  seo: {
    metaTitle: 'IdeaHub Connector | Transformando ideias em realidade',
    metaDescription: 'Plataforma que conecta pessoas com ideias a desenvolvedores profissionais para transformar projetos em realidade.',
    ogImage: '/images/og-image.png',
    keywords: 'desenvolvimento web, aplicativos, ideias, projetos digitais, desenvolvimento de software',
  }
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isGeneralFormDirty, setIsGeneralFormDirty] = useState(false);
  const [isSocialFormDirty, setIsSocialFormDirty] = useState(false);
  const [isFeaturesFormDirty, setIsFeaturesFormDirty] = useState(false);
  const [isSeoFormDirty, setIsSeoFormDirty] = useState(false);
  const [whatsAppApiKey, setWhatsAppApiKey] = useState<string>('');
  const [notificationNumbers, setNotificationNumbers] = useState<string[]>(['', '', '']);
  const [isNotificationsFormDirty, setIsNotificationsFormDirty] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('whatsapp_api_key') || '';
    setWhatsAppApiKey(savedApiKey);
    
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (savedNumbers) {
      try {
        const parsedNumbers = JSON.parse(savedNumbers);
        const normalizedNumbers = Array.isArray(parsedNumbers) && parsedNumbers.length <= 3 
          ? [...parsedNumbers, ...Array(3 - parsedNumbers.length).fill('')]
          : ['', '', ''];
        setNotificationNumbers(normalizedNumbers);
      } catch (error) {
        console.error('Error parsing notification numbers:', error);
        setNotificationNumbers(['', '', '']);
      }
    }
  }, []);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsGeneralFormDirty(true);
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
    setIsSocialFormDirty(true);
  };

  const handleFeatureToggle = (feature: keyof SiteSettings['features']) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
    setIsFeaturesFormDirty(true);
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value
      }
    }));
    setIsSeoFormDirty(true);
  };

  const handleNotificationsChange = (index: number, value: string) => {
    const updatedNumbers = [...notificationNumbers];
    updatedNumbers[index] = value;
    setNotificationNumbers(updatedNumbers);
    setIsNotificationsFormDirty(true);
  };

  const saveGeneralSettings = () => {
    toast.success('Configurações gerais salvas com sucesso!');
    setIsGeneralFormDirty(false);
  };

  const saveSocialSettings = () => {
    toast.success('Configurações de redes sociais salvas com sucesso!');
    setIsSocialFormDirty(false);
  };

  const saveFeatureSettings = () => {
    toast.success('Configurações de funcionalidades salvas com sucesso!');
    setIsFeaturesFormDirty(false);
  };

  const saveSeoSettings = () => {
    toast.success('Configurações de SEO salvas com sucesso!');
    setIsSeoFormDirty(false);
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('whatsapp_api_key', whatsAppApiKey);
    setApiKey(whatsAppApiKey);
    
    const filteredNumbers = notificationNumbers.filter(num => num.trim() !== '');
    localStorage.setItem('whatsapp_notification_numbers', JSON.stringify(filteredNumbers));
    
    toast.success('Configurações de notificação salvas com sucesso!');
    setIsNotificationsFormDirty(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações gerais do sistema e do site.
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input 
                    id="siteName" 
                    name="siteName" 
                    value={settings.siteName} 
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descrição do Site</Label>
                  <Textarea 
                    id="siteDescription" 
                    name="siteDescription" 
                    value={settings.siteDescription} 
                    onChange={handleGeneralChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de Contato</Label>
                  <Input 
                    id="contactEmail" 
                    name="contactEmail" 
                    type="email" 
                    value={settings.contactEmail} 
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefone</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={settings.phoneNumber} 
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    value={settings.address} 
                    onChange={handleGeneralChange}
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={saveGeneralSettings} 
                  disabled={!isGeneralFormDirty}
                >
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>
                  Configure os links para suas redes sociais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input 
                    id="facebook" 
                    name="facebook" 
                    value={settings.socialMedia.facebook} 
                    onChange={handleSocialChange}
                    placeholder="https://facebook.com/suapagina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input 
                    id="instagram" 
                    name="instagram" 
                    value={settings.socialMedia.instagram} 
                    onChange={handleSocialChange}
                    placeholder="https://instagram.com/suapagina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input 
                    id="twitter" 
                    name="twitter" 
                    value={settings.socialMedia.twitter} 
                    onChange={handleSocialChange}
                    placeholder="https://twitter.com/suapagina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    name="linkedin" 
                    value={settings.socialMedia.linkedin} 
                    onChange={handleSocialChange}
                    placeholder="https://linkedin.com/company/suapagina"
                  />
                </div>
                <Button 
                  onClick={saveSocialSettings} 
                  disabled={!isSocialFormDirty}
                >
                  Salvar Redes Sociais
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades do Site</CardTitle>
                <CardDescription>
                  Ative ou desative funcionalidades específicas do site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableBlog">Blog</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite a publicação de artigos e notícias no site.
                    </p>
                  </div>
                  <Switch 
                    id="enableBlog" 
                    checked={settings.features.enableBlog}
                    onCheckedChange={() => handleFeatureToggle('enableBlog')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableTestimonials">Depoimentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe depoimentos de clientes na página inicial.
                    </p>
                  </div>
                  <Switch 
                    id="enableTestimonials" 
                    checked={settings.features.enableTestimonials}
                    onCheckedChange={() => handleFeatureToggle('enableTestimonials')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableContactForm">Formulário de Contato</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que visitantes enviem mensagens através do site.
                    </p>
                  </div>
                  <Switch 
                    id="enableContactForm" 
                    checked={settings.features.enableContactForm}
                    onCheckedChange={() => handleFeatureToggle('enableContactForm')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableNewsletter">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Adiciona um formulário de inscrição para newsletter.
                    </p>
                  </div>
                  <Switch 
                    id="enableNewsletter" 
                    checked={settings.features.enableNewsletter}
                    onCheckedChange={() => handleFeatureToggle('enableNewsletter')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableUserRegistration">Registro de Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que visitantes criem novas contas.
                    </p>
                  </div>
                  <Switch 
                    id="enableUserRegistration" 
                    checked={settings.features.enableUserRegistration}
                    onCheckedChange={() => handleFeatureToggle('enableUserRegistration')}
                  />
                </div>
                
                <Button 
                  onClick={saveFeatureSettings} 
                  disabled={!isFeaturesFormDirty}
                >
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <AdminWhatsAppSettings />
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4 mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Logs do Sistema
              </h2>
              <p className="text-muted-foreground">
                Visualize os logs de operações e erros da integração com WhatsApp para ajudar na depuração de problemas.
              </p>
            </div>
            <WhatsAppLogViewer />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de SEO</CardTitle>
                <CardDescription>
                  Otimize seu site para mecanismos de busca.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Título Meta (Meta Title)</Label>
                  <Input 
                    id="metaTitle" 
                    name="metaTitle" 
                    value={settings.seo.metaTitle} 
                    onChange={handleSeoChange}
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Descrição Meta (Meta Description)</Label>
                  <Textarea 
                    id="metaDescription" 
                    name="metaDescription" 
                    value={settings.seo.metaDescription} 
                    onChange={handleSeoChange}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">Imagem OG (para compartilhamento)</Label>
                  <Input 
                    id="ogImage" 
                    name="ogImage" 
                    value={settings.seo.ogImage} 
                    onChange={handleSeoChange}
                  />
                  <p className="text-xs text-muted-foreground">URL da imagem (1200x630px recomendado)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Palavras-chave</Label>
                  <Textarea 
                    id="keywords" 
                    name="keywords" 
                    value={settings.seo.keywords} 
                    onChange={handleSeoChange}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Separadas por vírgula</p>
                </div>
                <Button 
                  onClick={saveSeoSettings} 
                  disabled={!isSeoFormDirty}
                >
                  Salvar Configurações de SEO
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
