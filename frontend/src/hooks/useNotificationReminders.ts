import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/types';
import { notificationsSlice } from '@/lib/store/slices/notificationsSlice';

/**
 * Custom hook to automatically generate notification reminders for breeding events and due dates.
 * This hook should be used in the main breeding components to ensure reminders are always up to date.
 */
export const useNotificationReminders = () => {
  const dispatch = useDispatch();
  const calendarEvents = useSelector((state: RootState) => state.breeding.calendarEvents || []);
  const breedingRecords = useSelector((state: RootState) => state.breeding.breedingRecords || []);
  const notifications = useSelector((state: RootState) => state.notifications.notifications || []);
  
  useEffect(() => {
    // Generate reminders whenever calendar events or breeding records change
    if (calendarEvents.length > 0 || breedingRecords.length > 0) {
      dispatch(notificationsSlice.actions.generateBreedingReminders({
        calendarEvents,
        breedingRecords
      }));
    }
  }, [calendarEvents, breedingRecords, dispatch]);
  
  // Return utilities for managing notifications
  return {
    notifications,
    unreadCount: useSelector((state: RootState) => state.notifications.unreadCount || 0),
    markAsRead: (id: string) => {
      dispatch(notificationsSlice.actions.markAsRead(id));
    },
    markAllAsRead: () => {
      dispatch(notificationsSlice.actions.markAllAsRead());
    },
    deleteNotification: (id: string) => {
      dispatch(notificationsSlice.actions.deleteNotification(id));
    },
    clearAllNotifications: () => {
      dispatch(notificationsSlice.actions.clearAllNotifications());
    },
    addNotification: (notification: {
      title: string;
      message: string;
      type?: 'info' | 'warning' | 'error' | 'success';
      relatedId?: string;
      relatedType?: string;
    }) => {
      dispatch(notificationsSlice.actions.addNotification(notification));
    }
  };
};