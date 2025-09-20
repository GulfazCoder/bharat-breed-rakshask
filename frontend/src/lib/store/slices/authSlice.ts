import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '@/lib/types';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async (phoneNumber: string) => {
    // Mock authentication - replace with Firebase Auth
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          phoneNumber,
          name: 'Farmer John',
          email: undefined,
          role: 'Farmer',
          farmIds: ['farm1'],
          language: 'en',
          aadhaarVerified: false,
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        resolve(mockUser);
      }, 1000);
    });
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Clear auth data
    return;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User>) => {
    // Mock API call - replace with real API
    return updates;
  }
);

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with phone
      .addCase(loginWithPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.error.message || 'Login failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      });
  },
});