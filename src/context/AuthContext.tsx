import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, AuthUser } from '../services/auth';
import { purchasesService } from '../services/purchases';
import { notificationService } from '../services/notifications';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        });

        if (user) {
          await purchasesService.configure(user.id);
          await purchasesService.login(user.id);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });

      if (user) {
        await purchasesService.login(user.id);
        await notificationService.registerForPushNotifications();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    const { user, error } = await authService.signUpWithEmail(email, password, fullName);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { user, error } = await authService.signInWithEmail(email, password);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signInWithApple = useCallback(async () => {
    const { user, error } = await authService.signInWithApple();
    if (error) {
      return { error: error.code === 'cancelled' ? null : error.message };
    }
    return { error: null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { user, error } = await authService.signInWithGoogle();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    await purchasesService.logout();
    await notificationService.cancelAllNotifications();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await authService.resetPassword(email);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const deleteAccount = useCallback(async () => {
    await notificationService.cancelAllNotifications();
    const { error } = await authService.deleteAccount();
    if (error) {
      return { error: error.message };
    }
    await purchasesService.logout();
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUpWithEmail,
        signInWithEmail,
        signInWithApple,
        signInWithGoogle,
        signOut,
        resetPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
