import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Phone, MessageSquare, Bell, Clock, Users, Briefcase, FileBarChart, Calendar } from 'lucide-react';
import { setApiKey, isWhatsAppConfigured } from '@/lib/whatsappService';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

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
  }
}

interface NotificationSettings {
  enabled: boolean;
  types: {
    events: boolean;
    newProjects: boolean;
    newUsers: boolean;
    dailyReport: boolean;
  };
  channels: {
    email: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  schedule: {
    dailyReportTime: string;
  };
}

const getInitialSettings = (): SiteSettings => {
  const savedSettings = localStorage.getItem('site_settings');
  
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error('Error parsing saved settings:', error);
    }
  }
  
  return {
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
};

const getInitialNotificationSettings = (): NotificationSettings => {
  const savedSettings = localStorage.getItem('system_notification_settings');
  
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error('Error parsing saved notification settings:', error);
    }
  }
  
  return {
    enabled: true,
    types: {
      events: true,
      newProjects: true,
      newUsers: true,
      dailyReport: false,
    },
    channels: {
      email: true,
      whatsapp: false,
      inApp: true,
    },
    schedule: {
      dailyReportTime: '08:00',
    },
  };
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(getInitialSettings());
  const [isGeneralFormDirty, setIsGeneralFormDirty] = useState(false);
  const [isSocialFormDirty, setIsSocialFormDirty] = useState(false);
  const [isFeaturesFormDirty, setIsFeaturesFormDirty] = useState(false);
  const [isSeoFormDirty, setIsSeoFormDirty] = useState(false);
  const [whatsAppApiKey, setWhatsAppApiKey] = useState<string>('');
  const [notificationNumbers, setNotificationNumbers] = useState<string[]>(['', '', '']);
  const [isNotificationsFormDirty, setIsNotificationsFormDirty] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getInitialNotificationSettings());
  const [isSystemNotificationsFormDirty, setIsSystemNotificationsFormDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSystemNotificationsToggle = (enabled: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      enabled
    }));
    setIsSystemNotificationsFormDirty(true);
  };

  const handleNotificationTypeToggle = (type: keyof NotificationSettings['types']) => {
    setNotificationSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
    setIsSystemNotificationsFormDirty(true);
  };

  const handleNotificationChannelToggle = (channel: keyof NotificationSettings['channels']) => {
    setNotificationSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
    setIsSystemNotificationsFormDirty(true);
  };

  const handleReportTimeChange = (time: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        dailyReportTime: time
      }
    }));
    setIsSystemNotificationsFormDirty(true);
  };

  const saveGeneralSettings = () => {
    setIsSaving(true);
    
    const updatedSettings = { ...settings };
    localStorage.setItem('site_settings', JSON.stringify(updatedSettings));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações gerais salvas com sucesso!');
      setIsGeneralFormDirty(false);
    }, 500);
  };

  const saveSocialSettings = () => {
    setIsSaving(true);
    
    const updatedSettings = { ...settings };
    localStorage.setItem('site_settings', JSON.stringify(updatedSettings));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de redes sociais salvas com sucesso!');
      setIsSocialFormDirty(false);
    }, 500);
  };

  const saveFeatureSettings = () => {
    setIsSaving(true);
    
    const updatedSettings = { ...settings };
    localStorage.setItem('site_settings', JSON.stringify(updatedSettings));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de funcionalidades salvas com sucesso!');
      setIsFeaturesFormDirty(false);
    }, 500);
  };

  const saveSeoSettings = () => {
    setIsSaving(true);
    
    const updatedSettings = { ...settings };
    localStorage.setItem('site_settings', JSON.stringify(updatedSettings));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de SEO salvas com sucesso!');
      setIsSeoFormDirty(false);
    }, 500);
  };

  const saveNotificationSettings = () => {
    setIsSaving(true);
    
    localStorage.setItem('whatsapp_api_key', whatsAppApiKey);
    setApiKey(whatsAppApiKey);
    
    const filteredNumbers = notificationNumbers.filter(num => num.trim() !== '');
    localStorage.setItem('whatsapp_notification_numbers', JSON.stringify(filteredNumbers));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de notificação salvas com sucesso!');
      setIsNotificationsFormDirty(false);
    }, 500);
  };

  const saveSystemNotificationSettings = () => {
    setIsSaving(true);
    
    localStorage.setItem('system_notification_settings', JSON.stringify(notificationSettings));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de notificações do sistema salvas com sucesso!');
      setIsSystemNotificationsFormDirty(false);
    }, 500);
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
            <TabsTrigger value="notifications">Notificações WhatsApp</TabsTrigger>
            <TabsTrigger value="system-notifications">Notificações Sistema</TabsTrigger>
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
                  disabled={!isGeneralFormDirty || isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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
                  disabled={!isSocialFormDirty || isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Redes Sociais'}
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
                  disabled={!isFeaturesFormDirty || isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificações WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure a integração com WhatsApp e números para notificações do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsAppApiKey" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    API Key do WhatsApp
                  </Label>
                  <Input 
                    id="whatsAppApiKey" 
                    value={whatsAppApiKey} 
                    onChange={(e) => {
                      setWhatsAppApiKey(e.target.value);
                      setIsNotificationsFormDirty(true);
                    }}
                    placeholder="Insira sua chave de API do WhatsApp"
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta chave é necessária para enviar notificações via WhatsApp.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Números para Notificações do Sistema
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Insira até 3 números que receberão notificações de todo o sistema.
                  </p>
                  
                  {notificationNumbers.map((number, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-[20px]">
                        {index + 1}.
                      </span>
                      <Input 
                        value={number} 
                        onChange={(e) => handleNotificationsChange(index, e.target.value)}
                        placeholder={`Número ${index + 1} (ex: 5511987654321)`}
                      />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={saveNotificationSettings} 
                  disabled={!isNotificationsFormDirty || isSaving}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Salvar Configurações de Notificação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system-notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificações do Sistema
                </CardTitle>
                <CardDescription>
                  Gerencie as notificações do sistema e defina quando e como você deseja recebê-las.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAllNotifications">Ativar Notificações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativa ou desativa todas as notificações do sistema
                    </p>
                  </div>
                  <Switch 
                    id="enableAllNotifications" 
                    checked={notificationSettings.enabled}
                    onCheckedChange={handleSystemNotificationsToggle}
                  />
                </div>
                
                <div className={notificationSettings.enabled ? "" : "opacity-50 pointer-events-none"}>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Tipos de Notificações</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="notifyEvents" 
                          checked={notificationSettings.types.events}
                          onCheckedChange={() => handleNotificationTypeToggle('events')}
                        />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="notifyEvents" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Eventos
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações sobre eventos agendados no sistema
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="notifyNewProjects" 
                          checked={notificationSettings.types.newProjects}
                          onCheckedChange={() => handleNotificationTypeToggle('newProjects')}
                        />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="notifyNewProjects" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Novos Projetos
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações quando novos projetos forem adicionados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="notifyNewUsers" 
                          checked={notificationSettings.types.newUsers}
                          onCheckedChange={() => handleNotificationTypeToggle('newUsers')}
                        />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="notifyNewUsers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Novos Usuários
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações quando novos usuários se registrarem
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="notifyDailyReport" 
                          checked={notificationSettings.types.dailyReport}
                          onCheckedChange={() => handleNotificationTypeToggle('dailyReport')}
                        />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="notifyDailyReport" className="flex items-center gap-2">
                            <FileBarChart className="h-4 w-4" />
                            Relatório Diário
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receba um relatório diário resumindo as atividades do sistema
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-6 ${notificationSettings.types.dailyReport ? "" : "opacity-50 pointer-events-none"}`}>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horário do Relatório Diário
                    </h3>
                    <div className="w-full sm:w-1/2 md:w-1/3">
                      <Input 
                        type="time" 
                        value={notificationSettings.schedule.dailyReportTime}
                        onChange={(e) => handleReportTimeChange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Relatório será enviado todos os dias neste horário (Horário de Brasília)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Canais de Notificação</h3>
                    <div className="flex flex-wrap gap-3">
                      <ToggleGroup type="multiple" className="justify-start">
                        <ToggleGroupItem 
                          value="email" 
                          aria-label="Toggle email"
                          data-state={notificationSettings.channels.email ? "on" : "off"}
                          onClick={() => handleNotificationChannelToggle('email')}
                        >
                          Email
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="whatsapp" 
                          aria-label="Toggle WhatsApp"
                          data-state={notificationSettings.channels.whatsapp ? "on" : "off"}
                          onClick={() => handleNotificationChannelToggle('whatsapp')}
                        >
                          WhatsApp
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="inApp" 
                          aria-label="Toggle In-App"
                          data-state={notificationSettings.channels.inApp ? "on" : "off"}
                          onClick={() => handleNotificationChannelToggle('inApp')}
                        >
                          No Sistema
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Selecione como deseja receber as notificações
                    </p>
                    
                    {notificationSettings.channels.whatsapp && !whatsAppApiKey && (
                      <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                        <p className="font-medium">Atenção:</p>
                        <p>Para receber notificações via WhatsApp, configure a API na aba "Notificações WhatsApp".</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={saveSystemNotificationSettings} 
                  disabled={!isSystemNotificationsFormDirty || isSaving}
                  className="flex items-center gap-2 mt-6"
                >
                  <Bell className="h-4 w-4" />
                  Salvar Configurações de Notificações
                </Button>
              </CardContent>
            </Card>
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
                  disabled={!isSeoFormDirty || isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configurações de SEO'}
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
