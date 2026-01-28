import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserService } from '@/entities/users/api/users-service';

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            return UserService.deleteUser(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(`Пользователь удалён`);
        },
    });
}
