import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authSlice } from './slices/authSlice';
import { animalsSlice } from './slices/animalsSlice';
import { breedsSlice } from './slices/breedsSlice';
import { breedingSlice } from './slices/breedingSlice';
import { notificationsSlice } from './slices/notificationsSlice';
import { offlineSlice } from './slices/offlineSlice';
import { RootState } from '@/lib/types';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'animals', 'breeds', 'breeding', 'offline'], // Only persist these slices
  blacklist: ['notifications'], // Don't persist notifications
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  animals: animalsSlice.reducer,
  breeds: breedsSlice.reducer,
  breeding: breedingSlice.reducer,
  notifications: notificationsSlice.reducer,
  offline: offlineSlice.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Types
export type AppDispatch = typeof store.dispatch;
export type { RootState };

export default store;