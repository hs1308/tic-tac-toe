import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

import { createClientId } from '../../lib/ids';
import { Profile } from '../../types/auth';
import { ensureProfile } from '../online-game/supabaseOnline';

const STORAGE_KEY = 'nested-tic-tac-toe-profile';

type AuthContextValue = {
  isLoading: boolean;
  profile: Profile | null;
  isSignedIn: boolean;
  hasCompletedOnboarding: boolean;
  mockSignIn: () => Promise<void>;
  saveProfile: (payload: { nickname: string; mascot: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (raw) {
        setProfile(JSON.parse(raw) as Profile);
      }

      setIsLoading(false);
    };

    void load();
  }, []);

  const persist = async (nextProfile: Profile | null) => {
    setProfile(nextProfile);

    if (!nextProfile) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
  };

  const mockSignIn = async () => {
    if (profile) {
      return;
    }

    await persist({
      id: createClientId('profile'),
      nickname: null,
      mascot: null,
    });
  };

  const saveProfile = async (payload: { nickname: string; mascot: string }) => {
    const currentProfile = profile ?? {
      id: createClientId('profile'),
      nickname: null,
      mascot: null,
    };

    const nextProfile = {
      ...currentProfile,
      nickname: payload.nickname.trim(),
      mascot: payload.mascot,
    };

    await persist(nextProfile);
    await ensureProfile(nextProfile);
  };

  const logout = async () => {
    await persist(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        profile,
        isSignedIn: Boolean(profile),
        hasCompletedOnboarding: Boolean(profile?.nickname && profile?.mascot),
        mockSignIn,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
