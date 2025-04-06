import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import axios, { AxiosInstance, AxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'

// -------------------
// API Client Setup
// -------------------

// Create an axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: 'http://10.10.8.201:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// -------------------
// Type Definitions
// -------------------

export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  [key: string]: any // For additional fields
}

export interface PasswordUpdate {
  oldPassword: string
  newPassword: string
}

export interface ProfileData {
  name?: string
  email?: string
  [key: string]: any // For additional profile fields
}

export interface AuthResponse {
  user: User
  accessToken: string
}

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  error: string | null
  register: (userData: RegisterData) => Promise<void>
  login: (credentials: LoginCredentials) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (profileData: ProfileData) => Promise<User>
  updatePassword: (passwordData: PasswordUpdate) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  clearError: () => void
}

// -------------------
// Context Creation
// -------------------

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// -------------------
// Auth Provider
// -------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Configure axios interceptors for token handling
  useEffect(() => {
    // Add a request interceptor
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add a response interceptor to handle 401 errors
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth data on 401 Unauthorized
          localStorage.removeItem('accessToken')
          setCurrentUser(null)
          // if (window.location.pathname !== '/sign-in-2') {
          // }
        }
        return Promise.reject(error)
      }
    )

    // Cleanup function
    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const response = await api.get<User>('/api/auth/me')
          setCurrentUser(response.data)
        }
      } catch (err) {
        localStorage.removeItem('accessToken')
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const clearError = (): void => {
    setError(null)
  }

  const handleApiError = (err: unknown): never => {
    if (axios.isAxiosError(err)) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred'
      )
    } else {
      setError('An unexpected error occurred')
    }
    throw err
  }

  const login = async ({
    email,
    password,
  }: LoginCredentials): Promise<User> => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      })
      const { user, accessToken } = response.data
      localStorage.setItem('accessToken', accessToken)
      setCurrentUser(user)
      return user
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await api.post('/api/auth/logout')
    } catch (err) {
      console.log('Logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      setCurrentUser(null)
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.post('/api/auth/register', userData)
      console.log(res)
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData: ProfileData): Promise<User> => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.put<User>('/api/user/profile', profileData)
      setCurrentUser(response.data)
      return response.data
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (
    passwordData: PasswordUpdate
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await api.put('/api/user/password', passwordData)
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await api.post(`/api/auth/reset-password/${token}`, { password })
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await api.post('/api/auth/forgot-password', { email })
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await api.get(`/api/auth/verify-email/${token}`)
    } catch (err) {
      return handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    resetPassword,
    forgotPassword,
    verifyEmail,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
