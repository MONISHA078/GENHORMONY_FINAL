import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // If we have a token, fetch the user profile to confirm validity
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
          if (profile?.role_name) {
            localStorage.setItem('role', profile.role_name);
          }
        } catch (err) {
          console.error("Failed to restore session", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      setToken(data.access_token);
      
      // Fetch profile details right after login
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot connect to backend server. Please ensure the backend server is running on http://localhost:8000.'
          : err.message || 'Login failed. Please check your credentials.');
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newProfile = await authService.register(userData);
      setLoading(false);
      return newProfile;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || "Registration failed. Try again.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const checkIsAdmin = () => {
    const roleFromState = user?.role_name?.toUpperCase();
    const roleFromStorage = localStorage.getItem('role')?.toUpperCase();
    return roleFromState === 'ADMIN' || roleFromStorage === 'ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin: checkIsAdmin(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
