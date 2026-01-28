'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AuthService } from '@/entities/auth/api/auth-service';
import { LoginRequest } from '@/entities/auth/model/auth-schemas';
import { setAuthMarker } from '@/features/auth/actions/set-auth-marker';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { resetRefreshState } from '@/shared/api/axios-instance';
import { env } from '@/shared/lib/env-config';
import { LOGIN_QUERY_KEY } from '@/shared/utils/constants/auth-query-key';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export const useLogin = () => {
    const { setToken, setUser, clearToken } = useAuthStore();
    const navigate = useRouter();
    const searchParams = useSearchParams();

    return useMutation({
        mutationKey: LOGIN_QUERY_KEY,
        mutationFn: (loginData: LoginRequest) => {
            void clearToken();
            return AuthService.Login(loginData);
        },
        onSuccess: async (data) => {
            resetRefreshState();
            setToken(data.accessToken);
            setUser(data.user);

            if (env.USE_DEV_AUTH_MARKER) {
                await setAuthMarker();
            }

            toast.success('Вход выполнен успешно');

            const nextPath = searchParams.get('next');
            const redirectPath = nextPath || ROUTER_MAP.DASHBOARD;

            navigate.push(redirectPath);
        },
    });
};
