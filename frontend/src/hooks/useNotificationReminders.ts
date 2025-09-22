import { useState } from 'react';

/**
 * Mock custom hook for notification reminders (simplified for demo)
 * This provides the same interface but doesn't depend on complex Redux state
 */
export const useNotificationReminders = () => {
  // Mock notifications data
  const [notifications] = useState([
    {
      id: '1',
      title: 'Breeding Reminder',
      message: 'Ganga is due for vaccination',
      type: 'info' as const,
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      title: 'Due Date Alert',
      message: 'Expected delivery in 25 days',
      type: 'warning' as const,
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [unreadCount] = useState(2);
  
  // Return utilities for managing notifications (simplified)
  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => {
      console.log('Marking notification as read:', id);
    },
    markAllAsRead: () => {
      console.log('Marking all notifications as read');
    },
    deleteNotification: (id: string) => {
      console.log('Deleting notification:', id);
    },
    clearAllNotifications: () => {
      console.log('Clearing all notifications');
    },
    addNotification: (notification: {
      title: string;
      message: string;
      type?: 'info' | 'warning' | 'error' | 'success';
      relatedId?: string;
      relatedType?: string;
    }) => {
      console.log('Adding notification:', notification);
    }
  };
};
