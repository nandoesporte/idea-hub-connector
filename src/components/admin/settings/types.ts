
export interface SiteSettings {
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

export interface NotificationSettings {
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
