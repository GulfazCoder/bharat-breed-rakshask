import { createSlice } from '@reduxjs/toolkit';
import { OfflineState } from '@/lib/types';

const initialState: OfflineState = {
  isOnline: true,
  pendingActions: [],
  lastSyncTime: null,
};

export const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    addPendingAction: (state, action) => {
      state.pendingActions.push(action.payload);
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
      state.lastSyncTime = new Date();
    },
  },
});
