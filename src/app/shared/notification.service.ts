import { computed, Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

export type NotificationType = Notification['type'];

/**
 * Notification Service using Angular Signals
 *
 * Manages application notifications with CRUD operations.
 * Demonstrates modern Angular patterns with signals.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private nextId = 1;

  // Computed signals
  readonly allNotifications = this.notifications.asReadonly();
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  /**
   * Add a new notification
   */
  add(message: string, type: NotificationType = 'info'): Notification {
    const notification: Notification = {
      id: this.nextId++,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.update((notifications) => [notification, ...notifications]);
    return notification;
  }

  /**
   * Add a success notification
   */
  success(message: string): Notification {
    return this.add(message, 'success');
  }

  /**
   * Add an error notification
   */
  error(message: string): Notification {
    return this.add(message, 'error');
  }

  /**
   * Add a warning notification
   */
  warning(message: string): Notification {
    return this.add(message, 'warning');
  }

  /**
   * Add an info notification
   */
  info(message: string): Notification {
    return this.add(message, 'info');
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: number): void {
    this.notifications.update((notifications) =>
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.update((notifications) => notifications.map((n) => ({ ...n, read: true })));
  }

  /**
   * Remove a notification by ID
   */
  remove(id: number): void {
    this.notifications.update((notifications) => notifications.filter((n) => n.id !== id));
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications.set([]);
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationType): Notification[] {
    return this.notifications().filter((n) => n.type === type);
  }

  /**
   * Get only unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications().filter((n) => !n.read);
  }
}
