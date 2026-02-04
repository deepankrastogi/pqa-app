import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  storeId: string;
  storeName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in production, this comes from your SSO/backend
const MOCK_USERS: Record<string, User> = {
  'staff@pizzaco.com': {
    id: 'user-001',
    email: 'staff@pizzaco.com',
    name: 'Alex Johnson',
    storeId: 'STORE-042',
    storeName: 'Downtown Pizza Co.',
  },
  'demo@demo.com': {
    id: 'user-002',
    email: 'demo@demo.com',
    name: 'Demo User',
    storeId: 'STORE-001',
    storeName: 'Demo Store',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pizza-analyzer-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('pizza-analyzer-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Accept any email for demo purposes, use mock data if available
    const mockUser = MOCK_USERS[normalizedEmail];
    const loggedInUser: User = mockUser || {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      storeId: `STORE-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
      storeName: 'Your Store',
    };

    setUser(loggedInUser);
    localStorage.setItem('pizza-analyzer-user', JSON.stringify(loggedInUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pizza-analyzer-user');
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
