import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'apartlo_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback(async (email: string, _password: string) => {
    // In production: validate credentials against your backend
    await new Promise(r => setTimeout(r, 800));
    const mockUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    // In production: create user account in your backend
    await new Promise(r => setTimeout(r, 1000));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    /**
     * Google OAuth stub — replace with real Google Auth
     * import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
     * or use @react-oauth/google with your clientId
     */
    await new Promise(r => setTimeout(r, 1000));
    const googleUser: User = {
      id: `google-${Date.now()}`,
      name: 'Google User',
      email: 'student@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      createdAt: new Date().toISOString(),
    };
    setUser(googleUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isAuthenticated: !!user, login, register, logout, loginWithGoogle } },
    children
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
