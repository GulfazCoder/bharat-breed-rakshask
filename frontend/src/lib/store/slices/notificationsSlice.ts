import { createSlice } from '@reduxjs/toolkit';
import { NotificationsState, Notification } from '@/lib/types';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification: Notification = {
        id: action.payload.id || `notification-${Date.now()}`,
        title: action.payload.title,
        message: action.payload.message,
        type: action.payload.type || 'info',
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: action.payload.relatedId,
        relatedType: action.payload.relatedType
      };
      state.notifications.push(notification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    generateBreedingReminders: (state, action) => {
      const { calendarEvents, breedingRecords } = action.payload;
      const now = new Date();
      const notificationIds = new Set(state.notifications.map(n => n.relatedId));
      
      // Generate reminders for upcoming calendar events (24 hours before)
      calendarEvents.forEach((event: any) => {
        const eventDate = new Date(event.start);
        const reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
        
        // Only create reminder if event is in the future and within next 7 days
        if (eventDate > now && eventDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
          const reminderId = `event-reminder-${event.id}`;
          
          if (!notificationIds.has(reminderId)) {
            const notification: Notification = {
              id: `notification-${Date.now()}-${Math.random()}`,
              title: `Upcoming ${event.type} Event`,
              message: `${event.title} is scheduled for ${eventDate.toLocaleDateString()}`,
              type: event.type === 'delivery' ? 'warning' : 'info',
              read: false,
              createdAt: new Date().toISOString(),
              relatedId: reminderId,
              relatedType: 'calendar_event'
            };
            state.notifications.push(notification);
            state.unreadCount += 1;
          }
        }
      });
      
      // Generate reminders for breeding records approaching due date (7 days and 1 day before)
      breedingRecords.forEach((record: any) => {
        if (record.pregnancyStatus === 'Expected' && record.expectedDueDate) {
          const dueDate = new Date(record.expectedDueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Create 7-day reminder
          if (daysUntilDue === 7) {
            const reminderId = `due-reminder-7d-${record.id}`;
            if (!notificationIds.has(reminderId)) {
              const notification: Notification = {
                id: `notification-${Date.now()}-${Math.random()}`,
                title: 'Due Date Approaching',
                message: `Delivery expected in 7 days for breeding record ${record.id}`,
                type: 'warning',
                read: false,
                createdAt: new Date().toISOString(),
                relatedId: reminderId,
                relatedType: 'breeding_record'
              };
              state.notifications.push(notification);
              state.unreadCount += 1;
            }
          }
          
          // Create 1-day reminder
          if (daysUntilDue === 1) {
            const reminderId = `due-reminder-1d-${record.id}`;
            if (!notificationIds.has(reminderId)) {
              const notification: Notification = {
                id: `notification-${Date.now()}-${Math.random()}`,
                title: 'Due Date Tomorrow!',
                message: `Delivery expected tomorrow for breeding record ${record.id}`,
                type: 'error',
                read: false,
                createdAt: new Date().toISOString(),
                relatedId: reminderId,
                relatedType: 'breeding_record'
              };
              state.notifications.push(notification);
              state.unreadCount += 1;
            }
          }
          
          // Create overdue reminder
          if (daysUntilDue < 0 && daysUntilDue >= -7) {
            const reminderId = `overdue-reminder-${record.id}`;
            if (!notificationIds.has(reminderId)) {
              const notification: Notification = {
                id: `notification-${Date.now()}-${Math.random()}`,
                title: 'Overdue Delivery',
                message: `Delivery is ${Math.abs(daysUntilDue)} days overdue for breeding record ${record.id}`,
                type: 'error',
                read: false,
                createdAt: new Date().toISOString(),
                relatedId: reminderId,
                relatedType: 'breeding_record'
              };
              state.notifications.push(notification);
              state.unreadCount += 1;
            }
          }
        }
      });
    },
  },
});
