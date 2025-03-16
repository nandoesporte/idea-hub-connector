
export interface PolicyData {
  id?: string;
  policy_number: string;
  customer: string;
  insurer: string;
  start_date: Date;
  end_date: Date;
  premium_amount: number;
  document_url?: string;
  status?: 'active' | 'pending' | 'expired';
  whatsapp_message_id?: string;
  processed_at?: Date;
  created_at?: Date;
}

// Project types
export type ProjectCategory = 'website' | 'e-commerce' | 'mobile-app' | 'desktop-app' | 'automation' | 'integration' | 'ai-solution' | 'other';

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  budget?: string;
  timeline?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: 'new' | 'reviewing' | 'approved' | 'in-progress' | 'completed' | 'rejected' | 'pending' | 'under-review';
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Additional properties used in the code
  features?: string[];
  urgency?: 'baixa' | 'normal' | 'alta';
  clientName?: string;
  userId?: string;
  statusUpdates?: Array<{date: Date, status: string, message: string}>;
  attachments?: string[];
}

// Portfolio types
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  client: string;
  completed: Date | string;
  technologies: string[];
  featured: boolean;
  featuredImage?: string;
  images: string[];
  link?: string;
}

// Category types
export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  type: 'tech' | 'insurance';
  icon: string;
  iconColor?: string;
  link: string;
  order?: number;
  enabled?: boolean;
}

// Navigation types
export interface NavigationItem {
  id?: string;
  title?: string;
  path?: string;
  // For compatibility with existing code
  label?: string;
  href?: string;
  icon?: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// Voice command event types
export interface VoiceCommandEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  contactPhone?: string;
  reminderScheduledFor?: Date;
  created_at: string | Date;
  createdAt?: Date;
}
