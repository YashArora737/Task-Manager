'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import { api, setTokens, clearTokens } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
    setTokens(data.data.accessToken, data.data.refreshToken);
    saveUser(data.data.user);
    toast.success(`Welcome back, ${data.data.user.username}!`);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', { email, username, password });
    setTokens(data.data.accessToken, data.data.refreshToken);
    saveUser(data.data.user);
    toast.success(`Welcome, ${data.data.user.username}!`);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ }
    clearTokens();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
