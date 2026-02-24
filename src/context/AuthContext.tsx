import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import {
  getProfile,
  upsertProfile,
  updateProfile as updateProfileApi,
} from '@/api/supabaseApi';

interface AuthState {
  user: User | null;
  session: Session | null;
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

function toE164(phone: string): string {
  if (phone.startsWith('+')) return phone;
  if (phone.startsWith('0')) return '+81' + phone.slice(1);
  return '+81' + phone;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isProfileComplete: false,
  });

  const loadProfile = useCallback(async (session: Session) => {
    const result = await getProfile(session.user.id);
    if (result) {
      setState({
        session,
        user: result.user,
        isLoading: false,
        isProfileComplete: result.isProfileComplete,
      });
    } else {
      setState({
        session,
        user: {
          id: session.user.id,
          phone: session.user.phone,
          displayName: 'ユーザー',
        },
        isLoading: false,
        isProfileComplete: false,
      });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session);
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadProfile(session);
      } else {
        setState({ user: null, session: null, isLoading: false, isProfileComplete: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const sendCode = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    if (error) throw new Error(error.message);
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: toE164(phone),
      token: code,
      type: 'sms',
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      if (!state.session) return;
      const updated = await updateProfileApi(state.session.user.id, user);
      setState((s) => ({ ...s, user: updated }));
    },
    [state.session]
  );

  const completeProfile = useCallback(
    async (profile: Partial<User>) => {
      if (!state.session) return;
      const updated = await upsertProfile(state.session.user.id, {
        ...state.user,
        ...profile,
      });
      setState((s) => ({ ...s, user: updated, isProfileComplete: true }));
    },
    [state.session, state.user]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, isLoading: false, isProfileComplete: false });
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
