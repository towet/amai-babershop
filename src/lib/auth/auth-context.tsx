import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, getCurrentSession } from '../services/auth-service';

// Define user roles
export type UserRole = 'manager' | 'barber';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  barberId?: string; // Only for barbers
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isManager: boolean;
  isBarber: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in from Supabase session
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { user: sessionUser, error: sessionError } = await getCurrentSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
        } else if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser, error: authError } = await signIn(email, password);
      
      if (authError) {
        setError(authError.message);
        return false;
      }
      
      if (!authUser) {
        setError('Invalid credentials');
        return false;
      }
      
      setUser(authUser);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await signOut();
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
        setError(signOutError.message);
      }
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = user !== null;
  const isManager = user?.role === 'manager';
  const isBarber = user?.role === 'barber';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      isManager,
      isBarber,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
