import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserService } from '@/entities/users/api/users-service';

export function useBlockUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, blocked }: { id: string; blocked: boolean }) => {
            return UserService.blockUser(id, blocked);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(data.blocked ? `Пользователь заблокирован` : `Пользователь разблокирован`);
        },
    });
}
