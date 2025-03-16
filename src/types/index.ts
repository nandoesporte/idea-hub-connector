export interface Policy {
  id: string;
  user_id: string;
  policy_number: string;
  customer_name: string;
  customer_phone?: string;
  issue_date: Date;
  expiry_date: Date;
  insurer: string;
  coverage_amount: number;
  premium: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending-renewal';
  type: string;
  attachment_url?: string;
  notes?: string;
  reminder_sent: boolean;
  reminder_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface VoiceCommandEvent {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  type: 'meeting' | 'deadline' | 'task' | 'other' | 'appointment' | 'reminder';
  contact_phone?: string;
  reminder_scheduled_for?: Date | null;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface VoiceCommandResult {
  success: boolean;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  type: 'meeting' | 'deadline' | 'task' | 'other' | 'appointment' | 'reminder';
  contactPhone?: string;
  error?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'completed' | 'on hold' | 'cancelled';
  start_date: Date;
  end_date?: Date;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'completed' | 'on hold' | 'cancelled';
  assigned_to: string;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id?: string;
  image_url?: string;
  project_url?: string;
  created_at: Date;
  updated_at: Date;
  category?: string;
  client?: string;
  completed?: Date;
  technologies?: string[];
  featured?: boolean;
  featuredImage?: string;
  images?: string[];
  link?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  policy_reminder_days?: number;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string;
  link: string;
  icon?: string;
  color?: string;
  enabled: boolean;
}

export interface DashboardComponent {
  id: string;
  title: string;
  description: string;
  type: 'tech' | 'insurance' | 'action' | 'quote';
  size?: 'small' | 'medium' | 'large' | 'full';
  order: number;
  enabled: boolean;
  items?: DashboardItem[];
}

export type ProjectCategory = 
  | 'website'
  | 'e-commerce'
  | 'mobile-app'
  | 'desktop-app'
  | 'automation'
  | 'integration'
  | 'ai-solution'
  | 'web-app'
  | 'other';

export interface ProjectIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  budget_range?: string;
  budget?: string;
  timeline?: string;
  contact_preference?: 'email' | 'phone' | 'whatsapp';
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'pending' | 'under-review' | 'in-progress';
  priority?: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
  clientName?: string;
  userId?: string;
  features?: string[];
  urgency?: string;
}

export interface NavigationItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
}

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  link: string;
  type: string;
  enabled: boolean;
  order?: number;
}
