import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import { authApi } from '@/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isProfileComplete: boolean;
}

interface AuthContextType extends AuthState {
  sendCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  updateUser: (user: User) => void;
  completeProfile: (profile: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isProfileComplete: false,
  });

  // Restore session on app start
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const userData = await SecureStore.getItemAsync('user_data');
        const profileComplete = await SecureStore.getItemAsync('profile_complete');
        if (token && userData) {
          setState({
            token,
            user: JSON.parse(userData),
            isLoading: false,
            isProfileComplete: profileComplete === 'true',
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    restore();
  }, []);

  const sendCode = useCallback(async (phone: string) => {
    await authApi.sendCode(phone);
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string) => {
    const result = await authApi.verifyCode(phone, code);
    const { token, user } = result;
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    setState((s) => ({ ...s, user, token, isProfileComplete: false }));
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      setState((s) => ({ ...s, user }));
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    },
    []
  );

  const completeProfile = useCallback(
    async (profile: Partial<User>) => {
      const updated = { ...state.user, ...profile } as User;
      setState((s) => ({ ...s, user: updated, isProfileComplete: true }));
      await SecureStore.setItemAsync('user_data', JSON.stringify(updated));
      await SecureStore.setItemAsync('profile_complete', 'true');
    },
    [state.user]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.deleteItemAsync('profile_complete');
    setState({ user: null, token: null, isLoading: false, isProfileComplete: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        sendCode,
        verifyCode,
        updateUser,
        completeProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
