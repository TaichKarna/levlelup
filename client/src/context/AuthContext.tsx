import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Define types for user data
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  register: (userData: Record<string, any>) => Promise<any>;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Record<string, any>) => Promise<User>;
  updatePassword: (passwordData: { oldPassword: string; newPassword: string }) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
}

// Create the AuthContext with a default value of `null`
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get<User>('/api/auth/me');
          setCurrentUser(response.data);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<{ user: User; accessToken: string }>('/api/auth/login', credentials);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setCurrentUser(user);
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/api/auth/logout');
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Define other functions with correct types...
  
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    register: async (userData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/api/auth/register', userData);
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    updateProfile: async (profileData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.put<User>('/api/user/profile', profileData);
        setCurrentUser(response.data);
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Profile update failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    updatePassword: async (passwordData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.put('/api/user/password', passwordData);
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Password update failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    resetPassword: async (token, password) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post(`/api/auth/reset-password/${token}`, { password });
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Password reset failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    forgotPassword: async (email) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Password reset request failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    verifyEmail: async (token) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/auth/verify-email/${token}`);
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Email verification failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
