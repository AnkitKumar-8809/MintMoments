import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  currentUser: {
    email: string;
    name?: string;
     displayName?: string; // 👈 add this
    authMethod?: string;
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
    email: string;
    name?: string;
    authMethod?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const res = await axios.get('http://localhost:3001/api/auth/me', {
        withCredentials: true
      });
      setCurrentUser(res.data.user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string, name?: string): Promise<void> {
    try {
      const res = await axios.post(
        'http://localhost:3001/api/auth/signup',
        { email, password, name },
        { withCredentials: true }
      );
      setCurrentUser(res.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Signup failed');
      }
      throw new Error('Signup failed');
    }
  }

  async function login(email: string, password: string): Promise<void> {
    try {
      const res = await axios.post(
        'http://localhost:3001/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      setCurrentUser(res.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Login failed');
      }
      throw new Error('Login failed');
    }
  }

  function loginWithGoogle(): void {
  window.location.href = 'http://localhost:3001/api/auth/google';
}

  async function logout(): Promise<void> {
    try {
      await axios.post(
        'http://localhost:3001/api/auth/logout',
        {},
        { withCredentials: true }
      );
      setCurrentUser(null);
    } catch (error) {
      setCurrentUser(null);
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
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
