import { create } from 'zustand';

import { UserAuth, UserAuthSchema } from '@/entities/users/model/user-schemas';
import { env } from '@/shared/lib/env-config';
import { resetRefreshState } from '@/shared/api/axios-instance';

const AUTH_USER_STORAGE_KEY = `${env.NEXT_PUBLIC_AUTH_TOKEN_KEY}_user`;

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
    setUser: (user: UserAuth | null) => {
        set({ user });

        if (typeof window === 'undefined') return;

        if (user) {
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        }
    },
    initializeAuth: () => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem(env.NEXT_PUBLIC_AUTH_TOKEN_KEY);
            const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

            let parsedUser: UserAuth | null = null;
            if (storedUser) {
                try {
                    const candidate = JSON.parse(storedUser);
                    const parsed = UserAuthSchema.safeParse(candidate);
                    if (parsed.success) {
                        parsedUser = parsed.data;
                    } else {
                        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
                    }
                } catch {
                    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
                }
            }

            if (storedToken) {
                set({ token: storedToken, user: parsedUser });
            } else if (storedUser) {
                localStorage.removeItem(AUTH_USER_STORAGE_KEY);
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
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    },
}));
