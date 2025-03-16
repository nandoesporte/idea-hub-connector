
import { Notification } from "@/types";
import { supabase } from "./supabase";
import { toast } from "sonner";

/**
 * Fetch notifications for a user
 */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((notification) => ({
      ...notification,
      created_at: new Date(notification.created_at),
      updated_at: new Date(notification.updated_at),
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Create a new notification
 */
export async function createNotification(
  notification: Omit<Notification, "id" | "created_at" | "updated_at" | "is_read">
): Promise<Notification> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          related_entity_type: notification.related_entity_type,
          related_entity_id: notification.related_entity_id,
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      throw new Error(error.message);
    }
    
    toast.success("Todas as notificações foram marcadas como lidas");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    toast.error("Erro ao marcar notificações como lidas");
    throw error;
  }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteAllReadNotifications(
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .eq("is_read", true);

    if (error) {
      throw new Error(error.message);
    }
    
    toast.success("Notificações lidas foram excluídas");
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    toast.error("Erro ao excluir notificações lidas");
    throw error;
  }
}
