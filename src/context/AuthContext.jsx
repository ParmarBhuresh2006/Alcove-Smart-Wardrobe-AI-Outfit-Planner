import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('alcove_token'));
  const [loading, setLoading] = useState(true);

  // On mount, validate existing token
  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('alcove_token');
          localStorage.removeItem('alcove_user');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    if (!data || !data.token) {
      throw new Error(data?.error || 'Login failed. Invalid response from server.');
    }
    localStorage.setItem('alcove_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    if (!data || !data.token) {
      throw new Error(data?.error || 'Registration failed. Invalid response from server.');
    }
    localStorage.setItem('alcove_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('alcove_token');
    localStorage.removeItem('alcove_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const updated = await authApi.updateMe(data);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
