import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchUserProfile();
    } else {
      setLoading(false);
    }

    // Socket.IO connection
    const newSocket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      const userData = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        isAdmin: response.data.isAdmin,
        address: response.data.address,
        bio: response.data.bio,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await api.post('/register', { name, email, password, phone });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      if (!error.response) {
        return {
          success: false,
          message: 'Unable to connect to server. Please check if the server is running.',
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/user/profile', updates);
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/user/password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Password change failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    changePassword,
    socket,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
