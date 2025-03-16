export type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
};

export type ProjectIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in progress' | 'completed' | 'on hold';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export type CategoryItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  link: string;
  type: 'tech' | 'insurance';
  order: number;
};

export type Policy = {
  id: string;
  userId: string;
  policyNumber: string;
  customerName: string;
  customerPhone?: string;
  issueDate: Date;
  expiryDate: Date;
  insurer: string;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'expired' | 'cancelled';
  type: 'auto' | 'life' | 'health' | 'home' | 'business' | 'other';
  attachmentUrl?: string;
  notes?: string;
  reminderSent: boolean;
  reminderDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardItem = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  link: string;
  enabled: boolean;
};

export type DashboardComponent = {
  id: string;
  title: string;
  description: string;
  type: 'tech' | 'insurance' | 'action' | 'quote';
  size?: 'small' | 'medium' | 'large' | 'full';
  order: number;
  enabled: boolean;
  items?: DashboardItem[];
};
