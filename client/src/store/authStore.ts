import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  initialize: () => Promise<void>;
  logout: () => void;
}

interface PersistedAuthState {
  user?: User | null;
}

/**
 * Access tokens are memory-only. The refresh token lives in an HttpOnly cookie
 * issued by the API, so neither token is reachable from JavaScript.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
      initialize: async () => {
        if (!get().user) return;

        try {
          const response = await axios.post(
            '/api/v1/auth/refresh-token',
            {},
            { withCredentials: true }
          );
          const { accessToken, user } = response.data.data as {
            accessToken: string;
            user: User;
          };
          set({ accessToken, user, isAuthenticated: true });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      version: 2,
      // Only the user profile is persisted. Older versions stored tokens in
      // localStorage; migration drops them definitively.
      migrate: (persistedState) =>
        ({ user: (persistedState as PersistedAuthState)?.user ?? null }) as AuthState,
      partialize: (state) => ({ user: state.user }),
    }
  )
);
