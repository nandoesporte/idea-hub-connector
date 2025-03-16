import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { setApiKey, isWhatsAppConfigured } from '@/lib/whatsappService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

// Import components
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import SocialSettings from '@/components/admin/settings/SocialSettings';
import FeatureSettings from '@/components/admin/settings/FeatureSettings';
import NotificationSettings from '@/components/admin/settings/NotificationSettings';
import SystemNotificationSettings from '@/components/admin/settings/SystemNotificationSettings';
import DefaultReminderSettings from '@/components/admin/settings/DefaultReminderSettings';
import SeoSettings from '@/components/admin/settings/SeoSettings';

// Import types
import { SiteSettings, NotificationSettings as NotificationSettingsType } from '@/components/admin/settings/types';

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

const getInitialNotificationSettings = (): NotificationSettingsType => {
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
    reminders: {
      enabled: true,
      sendBefore: {
        days: 1,
        hours: 0,
        minutes: 0
      },
      sendOnDay: true,
      reminderTime: "09:00"
    }
  };
};

const getInitialReminderSettings = () => {
  const savedSettings = localStorage.getItem('reminder_settings');
  
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error('Error parsing saved reminder settings:', error);
    }
  }
  
  return {
    enabled: true,
    sendBefore: {
      days: 1,
      hours: 0,
      minutes: 0
    },
    sendOnDay: true,
    reminderTime: "09:00",
    defaultPhone: ""
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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>(getInitialNotificationSettings());
  const [reminderSettings, setReminderSettings] = useState(getInitialReminderSettings());
  const [isReminderSettingsFormDirty, setIsReminderSettingsFormDirty] = useState(false);
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

  const handleGeneralChange = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsGeneralFormDirty(true);
  };

  const handleSocialChange = (name: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
    setIsSocialFormDirty(true);
  };

  const handleFeatureToggle = (feature: string) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature as keyof SiteSettings['features']]
      }
    }));
    setIsFeaturesFormDirty(true);
  };

  const handleSeoChange = (name: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value
      }
    }));
    setIsSeoFormDirty(true);
  };

  const handleApiKeyChange = (value: string) => {
    setWhatsAppApiKey(value);
    setIsNotificationsFormDirty(true);
  };

  const handleNotificationNumberChange = (index: number, value: string) => {
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

  const handleNotificationTypeToggle = (type: keyof NotificationSettingsType['types']) => {
    setNotificationSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
    setIsSystemNotificationsFormDirty(true);
  };

  const handleNotificationChannelToggle = (channel: keyof NotificationSettingsType['channels']) => {
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

  const handleReminderSettingsChange = (settings: any) => {
    setReminderSettings(settings);
    setIsReminderSettingsFormDirty(true);
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

  const saveReminderSettings = () => {
    setIsSaving(true);
    
    localStorage.setItem('reminder_settings', JSON.stringify(reminderSettings));
    
    if (reminderSettings.defaultPhone && reminderSettings.defaultPhone.trim() !== '') {
      localStorage.setItem('default_whatsapp_number', reminderSettings.defaultPhone.trim());
    } else {
      localStorage.removeItem('default_whatsapp_number');
    }
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de lembretes salvas com sucesso!');
      setIsReminderSettingsFormDirty(false);
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="notifications">Notificações WhatsApp</TabsTrigger>
            <TabsTrigger value="system-notifications">Notificações Sistema</TabsTrigger>
            <TabsTrigger value="reminders">Lembretes</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-6">
            <GeneralSettings 
              settings={settings}
              onSettingsChange={handleGeneralChange}
              onSave={saveGeneralSettings}
              isDirty={isGeneralFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4 mt-6">
            <SocialSettings 
              socialMedia={settings.socialMedia}
              onSocialChange={handleSocialChange}
              onSave={saveSocialSettings}
              isDirty={isSocialFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4 mt-6">
            <FeatureSettings 
              features={settings.features}
              onFeatureToggle={handleFeatureToggle}
              onSave={saveFeatureSettings}
              isDirty={isFeaturesFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <NotificationSettings 
              whatsAppApiKey={whatsAppApiKey}
              notificationNumbers={notificationNumbers}
              onApiKeyChange={handleApiKeyChange}
              onNumberChange={handleNotificationNumberChange}
              onSave={saveNotificationSettings}
              isDirty={isNotificationsFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="system-notifications" className="space-y-4 mt-6">
            <SystemNotificationSettings 
              notificationSettings={notificationSettings}
              whatsAppApiKey={whatsAppApiKey}
              onToggleEnabled={handleSystemNotificationsToggle}
              onToggleType={handleNotificationTypeToggle}
              onToggleChannel={handleNotificationChannelToggle}
              onTimeChange={handleReportTimeChange}
              onReminderSettingsChange={handleReminderSettingsChange}
              onSave={saveSystemNotificationSettings}
              isDirty={isSystemNotificationsFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="reminders" className="space-y-4 mt-6">
            <DefaultReminderSettings 
              reminderSettings={reminderSettings}
              onSettingsChange={handleReminderSettingsChange}
              onSave={saveReminderSettings}
              isDirty={isReminderSettingsFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4 mt-6">
            <SeoSettings 
              seo={settings.seo}
              onSeoChange={handleSeoChange}
              onSave={saveSeoSettings}
              isDirty={isSeoFormDirty}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
