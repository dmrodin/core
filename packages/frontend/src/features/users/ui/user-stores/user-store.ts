import { create } from 'zustand';

import { UserAuth } from '@/entities/users/model/user-schemas';
import { env } from '@/shared/lib/env-config';
import { resetRefreshState } from '@/shared/api/axios-instance';

export interface AuthState {
    clearToken: () => Promise<void>;
    setToken: (token: string | null) => Promise<void>;
    setUser: (user: UserAuth | null) => void;
    initializeAuth: () => void;
    token: string | null;
    user: UserAuth | null;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setUser: (user: UserAuth | null) => set({ user }),
    initializeAuth: () => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem(env.NEXT_PUBLIC_AUTH_TOKEN_KEY);
            if (storedToken) {
                set({ token: storedToken });
            }
        }
    },
    setToken: async (token: string | null) => {
        if (token) {
            set({ token });
            localStorage.setItem(env.NEXT_PUBLIC_AUTH_TOKEN_KEY, token);
            resetRefreshState();
        }
    },
    clearToken: async () => {
        set({ token: null, user: null });
        localStorage.removeItem(env.NEXT_PUBLIC_AUTH_TOKEN_KEY);
    },
}));
