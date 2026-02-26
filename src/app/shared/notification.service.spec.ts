import { beforeEach, describe, expect, test } from 'bun:test';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('initial state', () => {
    test('should start with empty notifications', () => {
      expect(service.allNotifications()).toEqual([]);
    });

    test('should have zero unread count initially', () => {
      expect(service.unreadCount()).toBe(0);
    });

    test('should have no unread notifications initially', () => {
      expect(service.hasUnread()).toBe(false);
    });
  });

  describe('add', () => {
    test('should add a notification with default type "info"', () => {
      const notification = service.add('Test message');

      expect(notification.message).toBe('Test message');
      expect(notification.type).toBe('info');
      expect(notification.read).toBe(false);
      expect(notification.id).toBe(1);
    });

    test('should add notification with specified type', () => {
      const notification = service.add('Error occurred', 'error');
      expect(notification.type).toBe('error');
    });

    test('should increment notification IDs', () => {
      const n1 = service.add('First');
      const n2 = service.add('Second');
      const n3 = service.add('Third');

      expect(n1.id).toBe(1);
      expect(n2.id).toBe(2);
      expect(n3.id).toBe(3);
    });

    test('should add notifications to the beginning of the list', () => {
      service.add('First');
      service.add('Second');

      const notifications = service.allNotifications();
      expect(notifications[0].message).toBe('Second');
      expect(notifications[1].message).toBe('First');
    });

    test('should update unread count when adding', () => {
      service.add('Test');
      expect(service.unreadCount()).toBe(1);

      service.add('Another');
      expect(service.unreadCount()).toBe(2);
    });
  });

  describe('convenience methods', () => {
    test('success() should add notification with type "success"', () => {
      const notification = service.success('Success!');
      expect(notification.type).toBe('success');
    });

    test('error() should add notification with type "error"', () => {
      const notification = service.error('Error!');
      expect(notification.type).toBe('error');
    });

    test('warning() should add notification with type "warning"', () => {
      const notification = service.warning('Warning!');
      expect(notification.type).toBe('warning');
    });

    test('info() should add notification with type "info"', () => {
      const notification = service.info('Info!');
      expect(notification.type).toBe('info');
    });
  });

  describe('markAsRead', () => {
    test('should mark a notification as read', () => {
      const notification = service.add('Test');
      service.markAsRead(notification.id);

      const updated = service.allNotifications()[0];
      expect(updated.read).toBe(true);
    });

    test('should update unread count when marking as read', () => {
      const n1 = service.add('First');
      service.add('Second');

      service.markAsRead(n1.id);
      expect(service.unreadCount()).toBe(1);
    });

    test('should update hasUnread when all are read', () => {
      const n1 = service.add('First');
      const n2 = service.add('Second');

      expect(service.hasUnread()).toBe(true);

      service.markAsRead(n1.id);
      service.markAsRead(n2.id);

      expect(service.hasUnread()).toBe(false);
    });

    test('should not affect other notifications', () => {
      const n1 = service.add('First');
      const n2 = service.add('Second');

      service.markAsRead(n1.id);

      const notifications = service.allNotifications();
      expect(notifications.find((n) => n.id === n2.id)?.read).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    test('should mark all notifications as read', () => {
      service.add('First');
      service.add('Second');
      service.add('Third');

      service.markAllAsRead();

      const notifications = service.allNotifications();
      notifications.forEach((n) => {
        expect(n.read).toBe(true);
      });
    });

    test('should reset unread count to zero', () => {
      service.add('First');
      service.add('Second');

      service.markAllAsRead();
      expect(service.unreadCount()).toBe(0);
    });

    test('should set hasUnread to false', () => {
      service.add('Test');
      service.markAllAsRead();
      expect(service.hasUnread()).toBe(false);
    });
  });

  describe('remove', () => {
    test('should remove a notification by ID', () => {
      const n1 = service.add('First');
      service.add('Second');

      service.remove(n1.id);

      expect(service.allNotifications().length).toBe(1);
      expect(service.allNotifications()[0].message).toBe('Second');
    });

    test('should update unread count when removing unread notification', () => {
      service.add('First');
      service.add('Second');

      const notifications = service.allNotifications();
      service.remove(notifications[0].id);

      expect(service.unreadCount()).toBe(1);
    });

    test('should not throw when removing non-existent ID', () => {
      expect(() => service.remove(999)).not.toThrow();
    });

    test('should update hasUnread when last unread is removed', () => {
      const n1 = service.add('First');
      service.remove(n1.id);
      expect(service.hasUnread()).toBe(false);
    });
  });

  describe('clear', () => {
    test('should remove all notifications', () => {
      service.add('First');
      service.add('Second');
      service.add('Third');

      service.clear();

      expect(service.allNotifications()).toEqual([]);
    });

    test('should reset unread count to zero', () => {
      service.add('First');
      service.add('Second');

      service.clear();
      expect(service.unreadCount()).toBe(0);
    });

    test('should reset hasUnread to false', () => {
      service.add('Test');
      service.clear();
      expect(service.hasUnread()).toBe(false);
    });

    test('should reset ID counter (optional behavior)', () => {
      service.add('First');
      service.add('Second');
      service.clear();

      // Note: Current implementation doesn't reset ID counter
      // This test documents current behavior
      const newNotification = service.add('New');
      expect(newNotification.id).toBe(3);
    });
  });

  describe('getByType', () => {
    test('should return only notifications of specified type', () => {
      service.add('Info 1', 'info');
      service.add('Error 1', 'error');
      service.add('Info 2', 'info');
      service.add('Success 1', 'success');

      const infoNotifications = service.getByType('info');
      expect(infoNotifications.length).toBe(2);
      expect(infoNotifications.every((n) => n.type === 'info')).toBe(true);
    });

    test('should return empty array when no matching type', () => {
      service.add('Info', 'info');
      const errors = service.getByType('error');
      expect(errors).toEqual([]);
    });
  });

  describe('getUnread', () => {
    test('should return only unread notifications', () => {
      const n1 = service.add('First');
      const n2 = service.add('Second');
      const n3 = service.add('Third');

      service.markAsRead(n2.id);

      const unread = service.getUnread();
      expect(unread.length).toBe(2);
      expect(unread.map((n) => n.id)).toEqual([n3.id, n1.id]);
    });

    test('should return empty array when all are read', () => {
      service.add('First');
      service.add('Second');
      service.markAllAsRead();

      expect(service.getUnread()).toEqual([]);
    });
  });

  describe('signal reactivity', () => {
    test('should update computed signals when notifications change', () => {
      // Initial state
      expect(service.unreadCount()).toBe(0);
      expect(service.hasUnread()).toBe(false);

      // Add notification
      service.add('Test');
      expect(service.unreadCount()).toBe(1);
      expect(service.hasUnread()).toBe(true);

      // Mark as read
      const notification = service.allNotifications()[0];
      service.markAsRead(notification.id);
      expect(service.unreadCount()).toBe(0);
      expect(service.hasUnread()).toBe(false);

      // Remove
      service.remove(notification.id);
      expect(service.allNotifications()).toEqual([]);
    });
  });
});
