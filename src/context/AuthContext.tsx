import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WorkerProfile, EmployerProfile } from '../types.ts';
import { AUTH_STORAGE_KEY, apiFetch } from '../utils/api.ts';

interface AuthContextType {
  currentUser: User | null;
  workerProfile: WorkerProfile | null;
  employerProfile: EmployerProfile | null;
  isLoading: boolean;
  dbStatus: { jobsCount: number; isEmpty: boolean } | null;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  resetDatabaseEmpty: () => Promise<void>;
  seedDatabaseDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ jobsCount: number; isEmpty: boolean } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({ jobsCount: data.jobsCount, isEmpty: data.isEmpty });
      }
    } catch {
      // ignore
    }
  };

  const fetchCurrent = async () => {
    try {
      const storedId = localStorage.getItem(AUTH_STORAGE_KEY);
      const headers: Record<string, string> = {};
      if (storedId) {
        headers['x-user-id'] = storedId;
      }
      const res = await fetch('/api/auth/current', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          setWorkerProfile(data.workerProfile);
          setEmployerProfile(data.employerProfile);
        } else {
          if (storedId) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
          setCurrentUser(null);
          setWorkerProfile(null);
          setEmployerProfile(null);
        }
      }
      await fetchDbStatus();
    } catch (e) {
      console.error('Failed to load current user session:', e);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to sign in. Please check your credentials.' };
      }

      localStorage.setItem(AUTH_STORAGE_KEY, data.user.id);
      setCurrentUser(data.user);
      setWorkerProfile(data.workerProfile || null);
      setEmployerProfile(data.employerProfile || null);
      await fetchDbStatus();
      return { success: true };
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, error: 'Network error occurred while signing in.' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (formData: any): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      localStorage.setItem(AUTH_STORAGE_KEY, data.user.id);
      setCurrentUser(data.user);
      setWorkerProfile(data.workerProfile || null);
      setEmployerProfile(data.employerProfile || null);
      await fetchDbStatus();
      return { success: true };
    } catch (e) {
      console.error('Registration error:', e);
      return { success: false, error: 'Network error occurred during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setWorkerProfile(null);
    setEmployerProfile(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  };

  const resetDatabaseEmpty = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/db/reset-empty', { method: 'POST' });
      await fetchCurrent();
    } catch (err) {
      console.error('Failed to reset db:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const seedDatabaseDemo = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/db/seed', { method: 'POST' });
      await fetchCurrent();
    } catch (err) {
      console.error('Failed to seed db:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        workerProfile,
        employerProfile,
        isLoading,
        dbStatus,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        registerUser,
        logout,
        refreshUserData: fetchCurrent,
        resetDatabaseEmpty,
        seedDatabaseDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
