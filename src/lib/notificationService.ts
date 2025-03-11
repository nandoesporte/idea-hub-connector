
import { supabase } from './supabase';
import { Notification } from '@/types';

export const fetchUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data.map(notification => ({
    ...notification,
    createdAt: new Date(notification.created_at),
    userId: notification.user_id,
    isRead: notification.is_read,
    relatedEntityType: notification.related_entity_type,
    relatedEntityId: notification.related_entity_id
  })) as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }

  return true;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }

  return true;
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_entity_type: notification.relatedEntityType,
      related_entity_id: notification.relatedEntityId,
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return data[0];
};
