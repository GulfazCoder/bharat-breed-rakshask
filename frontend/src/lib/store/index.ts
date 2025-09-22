import { configureStore, combineReducers, createSlice } from '@reduxjs/toolkit';

// Import actual slices
import { breedingSlice } from './slices/breedingSlice';
import { authSlice } from './slices/authSlice';

// Simple mock slices for others that don't exist yet
const createMockSlice = (name: string, initialState: any = {}) => createSlice({
  name,
  initialState,
  reducers: {
    // Add a generic update reducer for flexibility
    updateState: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

// Use actual slices where available, mock ones where not
const animalsSlice = createMockSlice('animals', {
  animals: [],
  selectedAnimal: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    breedId: null,
    healthStatus: null,
    isPregnant: null
  }
});

const breedsSlice = createMockSlice('breeds', {
  breeds: [],
  selectedBreed: null,
  loading: false,
  error: null
});

const notificationsSlice = createMockSlice('notifications', {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
});

const offlineSlice = createMockSlice('offline', {
  isOnline: true,
  pendingActions: [],
  lastSyncTime: null
});

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  animals: animalsSlice.reducer,
  breeds: breedsSlice.reducer,
  breeding: breedingSlice.reducer, // Use actual breeding slice
  notifications: notificationsSlice.reducer,
  offline: offlineSlice.reducer,
});

// Configure store (simplified without persistence)
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

// Types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
