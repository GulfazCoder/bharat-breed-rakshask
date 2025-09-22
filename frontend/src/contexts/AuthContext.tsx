'use client';

import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

// Simplified User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  stats?: {
    classificationsCount?: number;
    favoriteBreeds?: string[];
    expertVerifications?: number;
  };
}

// Simplified Auth context interface  
interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Auth provider component (simplified for demo)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock auth functions
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock sign in
      const mockUser = { uid: '1', email, displayName: 'Demo User' };
      setUser(mockUser);
      setUserProfile(mockUser);
      toast.success('Signed in successfully!');
    } catch (error) {
      toast.error('Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Mock sign up
      const mockUser = { uid: '1', email, displayName };
      setUser(mockUser);
      setUserProfile(mockUser);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const mockUser = { uid: '1', email: 'demo@gmail.com', displayName: 'Demo User' };
      setUser(mockUser);
      setUserProfile(mockUser);
      toast.success('Signed in with Google!');
    } catch (error) {
      toast.error('Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const mockUser = { uid: '1', email: 'demo@facebook.com', displayName: 'Demo User' };
      setUser(mockUser);
      setUserProfile(mockUser);
      toast.success('Signed in with Facebook!');
    } catch (error) {
      toast.error('Failed to sign in with Facebook');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email');
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    // Mock refresh - nothing to do
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}