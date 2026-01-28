import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@/entities/auth/api/auth-service';
import { deleteAuthMarker } from '@/features/auth/actions/set-auth-marker';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { env } from '@/shared/lib/env-config';
import { LOGOUT_QUERY_KEY } from '@/shared/utils/constants/auth-query-key';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export const useLogout = () => {
    const clearToken = useAuthStore().clearToken;
    const router = useRouter();

    return useMutation({
        mutationKey: [LOGOUT_QUERY_KEY],
        mutationFn: async () => await AuthService.Logout(),
        onSuccess: async () => {
            await clearToken();

            if (env.USE_DEV_AUTH_MARKER) {
                await deleteAuthMarker();
            }

            router.push(ROUTER_MAP.LOGIN);
        },
    });
};
