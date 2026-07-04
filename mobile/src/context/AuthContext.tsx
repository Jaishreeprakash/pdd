import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../services/api';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await StorageService.getToken();
      if (token) {
        const savedUser = await StorageService.getUser();
        if (savedUser) {
          setUser(savedUser);
        } else {
          const fetchedUser = await authApi.getCurrentUser();
          setUser(fetchedUser);
          await StorageService.saveUser(fetchedUser);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await StorageService.clearAll();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const tokens = await authApi.login(credentials);
    await StorageService.saveToken(tokens.access_token);
    const currentUser = await authApi.getCurrentUser();
    await StorageService.saveUser(currentUser);
    setUser(currentUser);
  };

  const register = async (data: RegisterRequest) => {
    const newUser = await authApi.register(data);
    // Auto-login after register
    await login({ username: data.username, password: data.password });
  };

  const logout = async () => {
    await StorageService.clearAll();
    setUser(null);
  };

  const demoLogin = async () => {
    const demoUser: User = {
      id: 999,
      username: 'demo_user',
      email: 'demo@burnoutai.com',
      full_name: 'Alex Johnson',
      age: 28,
      gender: 'prefer_not_to_say',
      created_at: new Date().toISOString(),
      is_active: true,
    };
    await StorageService.saveToken('demo_token_xyz');
    await StorageService.saveUser(demoUser);
    setUser(demoUser);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
