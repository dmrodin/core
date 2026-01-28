'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { RegisterRequestSchema } from '@/entities/auth';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useCreateUser } from '@/features/users/hooks/use-user-create';
import { ROUTER_MAP } from '@/shared';
import { Button } from '@/shared/ui/shadcn/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/shadcn/form';
import { Input } from '@/shared/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';

const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Администратор',
    [UserRole.MODERATOR]: 'Модератор',
    [UserRole.USER]: 'Пользователь',
};

export function CreateUserForm() {
    const router = useRouter();
    const createUserMutation = useCreateUser();

    const form = useForm<z.infer<typeof RegisterRequestSchema>>({
        resolver: zodResolver(RegisterRequestSchema),
        defaultValues: {
            username: '',
            password: '',
            roles: [UserRole.USER],
        },
    });

    const onSubmit = (values: z.infer<typeof RegisterRequestSchema>) => {
        createUserMutation.mutate(values, {
            onSuccess: () => {
                form.reset();
                router.push(ROUTER_MAP.USERS);
            },
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Имя пользователя</FormLabel>
                            <FormDescription>Укажите имя пользователю</FormDescription>
                            <FormControl>
                                <Input placeholder="Введите имя пользователя" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormDescription>Минимум 8 символов, должен содержать буквы и цифры</FormDescription>
                            <FormControl>
                                <Input type="password" placeholder="Введите пароль" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Роли</FormLabel>
                            <FormDescription>Укажите роли для нового пользователя.</FormDescription>
                            <FormControl>
                                <Select onValueChange={(value) => field.onChange([value])} value={field.value?.[0]}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Выберите роль" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(UserRole).map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {ROLE_LABELS[role]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Создание...' : 'Создать'}
                </Button>
            </form>
        </Form>
    );
}
