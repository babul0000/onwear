'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { API_URL } from '../config';

export interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; code?: string }>;
  register: (name: string, email: string, password: string, phone: string, address: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (name: string, phone: string, address: string) => Promise<{ success: boolean; message?: string }>;
  setAuthSession: (user: any, token: string) => void;
  verifyActivationToken: (token: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  setPasswordAndActivate: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
  resendActivation: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('shopnest_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (jwtToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        // Token might have expired
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('shopnest_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message, code: data.error?.code };
      }
    } catch (err) {
      return { success: false, message: 'Server connection error during login.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, address: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, phone, address })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server error during registration.' };
    }
  };

  const setAuthSession = (newUser: any, newToken: string) => {
    localStorage.setItem('shopnest_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('shopnest_token');
    setToken(null);
    setUser(null);
  };

  const verifyActivationToken = async (rawToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-activation-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Invalid activation token' };
    } catch (err) {
      return { success: false, message: 'Unable to verify activation link' };
    }
  };

  const setPasswordAndActivate = async (rawToken: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken, password })
      });
      const data = await res.json();
      if (data.success) {
        setAuthSession(data.data.user, data.data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Failed to activate account' };
    } catch (err) {
      return { success: false, message: 'Server communication error' };
    }
  };

  const resendActivation = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error while requesting activation email.' };
    }
  };

  const updateProfile = async (name: string, phone: string, address: string) => {
    if (!token || !user) return { success: false, message: 'Not authenticated' };

    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, address })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      setAuthSession,
      verifyActivationToken,
      setPasswordAndActivate,
      resendActivation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

