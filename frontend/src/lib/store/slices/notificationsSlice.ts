import { createSlice } from '@reduxjs/toolkit';
import { NotificationsState } from '@/lib/types';

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
      state.notifications.push(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
  },
});
