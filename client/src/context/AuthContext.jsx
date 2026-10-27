import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    configured: false,
    checked: false,
    error: null,
  });

  // Check health and MongoDB Atlas status
  const checkAtlasStatus = async () => {
    try {
      const health = await api.getHealth();
      if (health && health.database) {
        setDbStatus({
          connected: Boolean(health.database.connected),
          configured: Boolean(health.database.configured),
          type: health.database.type || 'MongoDB',
          error: health.database.error,
          checked: true,
        });
      }
    } catch (err) {
      setDbStatus((prev) => ({
        ...prev,
        connected: false,
        checked: true,
        error: 'Cannot reach backend server. Please ensure KeepLoop server is running.',
      }));
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      await checkAtlasStatus();
      const token = getToken();

      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            removeToken();
            setUser(null);
          }
        } catch (err) {
          console.warn('Authentication token expired or invalid:', err.message);
          removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Failed to login');
  };

  const register = async (name, email, password, currency) => {
    const res = await api.register({ name, email, password, currency });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Failed to register');
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        dbStatus,
        checkAtlasStatus,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

