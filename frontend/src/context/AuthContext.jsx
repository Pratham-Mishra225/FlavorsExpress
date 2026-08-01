import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { id, token: jwtToken, email: userEmail, role } = response.data;
      
      const userInfo = { id, email: userEmail, role };
      
      localStorage.setItem('jwt_token', jwtToken);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      
      setToken(jwtToken);
      setUser(userInfo);
      return { success: true, role };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      const { id, token: jwtToken, email: userEmail, role } = response.data;
      
      const userInfo = { id, email: userEmail, role };
      
      localStorage.setItem('jwt_token', jwtToken);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      
      setToken(jwtToken);
      setUser(userInfo);
      return { success: true, role };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
