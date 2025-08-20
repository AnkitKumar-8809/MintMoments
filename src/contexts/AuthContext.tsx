import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface AuthContextType {
  currentUser: {
    id?: string;
    email: string;
    name?: string;
    displayName?: string;
    authMethod?: string;
    profilePicture?: string;
  } | null;
  signup(email: string, password: string, name?: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  loginWithGoogle(): void;
  logout(): Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    email: string;
    name?: string;
    displayName?: string;
    authMethod?: string;
    profilePicture?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults for production/development
  useEffect(() => {
    // Set up axios defaults
    axios.defaults.withCredentials = true;
    
    // Debug API URL
    if (import.meta.env.MODE === 'development') {
      console.log('🔧 API Base URL:', API_BASE_URL);
      console.log('🔧 Environment Mode:', import.meta.env.MODE);
    }
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
    
    // Check for auth success/error from URL params (after Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const authError = urlParams.get('error');
    
    if (authSuccess === 'success') {
      // Remove success param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Re-check auth status to get user data
      setTimeout(checkAuthStatus, 500);
    }
    
    if (authError) {
      console.error('Authentication error:', authError);
      setCurrentUser(null);
      setLoading(false);
      // Remove error param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function checkAuthStatus() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });
      
      if (res.data && res.data.user) {
        setCurrentUser(res.data.user);
        if (import.meta.env.MODE === 'development') {
          console.log('✅ User authenticated:', res.data.user.email);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          console.error('❌ Network error: Backend server might be down');
        } else if (error.response?.status === 401) {
          // User not authenticated - this is normal
          if (import.meta.env.MODE === 'development') {
            console.log('ℹ️ User not authenticated');
          }
        } else {
          console.error('❌ Auth check error:', error.response?.status, error.message);
        }
      }
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string, name?: string): Promise<void> {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/signup`,
        { email, password, name },
        { 
          withCredentials: true,
          timeout: 10000
        }
      );
      
      if (res.data && res.data.user) {
        setCurrentUser(res.data.user);
        console.log('✅ Signup successful:', res.data.user.email);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Signup failed. Please try again.';
        throw new Error(errorMessage);
      }
      throw new Error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<void> {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { 
          withCredentials: true,
          timeout: 10000
        }
      );
      
      if (res.data && res.data.user) {
        setCurrentUser(res.data.user);
        console.log('✅ Login successful:', res.data.user.email);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }
      throw new Error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle(): void {
    try {
      // Store current location to redirect back after OAuth
      const currentPath = window.location.pathname;
      localStorage.setItem('preAuthPath', currentPath);
      
      // Redirect to backend Google OAuth route
      const googleAuthUrl = `${API_BASE_URL}/api/auth/google`;
      
      if (import.meta.env.MODE === 'development') {
        console.log('🔄 Redirecting to Google OAuth:', googleAuthUrl);
      }
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('❌ Google OAuth redirect failed:', error);
      throw new Error('Failed to initiate Google sign-in');
    }
  }

  async function logout(): Promise<void> {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { 
          withCredentials: true,
          timeout: 5000
        }
      );
      
      setCurrentUser(null);
      
      // Clear any stored auth data
      localStorage.removeItem('preAuthPath');
      
      console.log('✅ Logout successful');
    } catch (error) {
      // Even if logout request fails, clear user locally
      setCurrentUser(null);
      console.warn('⚠️ Logout request failed, but user cleared locally');
    } finally {
      setLoading(false);
    }
  }

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-primary flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
            {import.meta.env.MODE === 'development' && (
              <p className="text-sm text-gray-400 mt-2">
                Connecting to: {API_BASE_URL}
              </p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
