import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../../../shared/types/auth';
import { authApiService } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on app start
  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const storedToken = localStorage.getItem('tellus_token');
        
        if (storedToken) {
          const result = await authApiService.verifyToken(storedToken);
          
          if (result.valid) {
            setUser(result.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('tellus_token');
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('tellus_token');
      } finally {
        setLoading(false);
      }
    };

    checkStoredToken();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const authResponse = await authApiService.login(credentials);
      
      setUser(authResponse.user);
      setToken(authResponse.token);
      localStorage.setItem('tellus_token', authResponse.token);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tellus_token');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
