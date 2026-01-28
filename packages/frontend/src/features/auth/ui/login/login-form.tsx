'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { type LoginRequest, LoginRequestSchema } from '@/entities/auth/model/auth-schemas';
import { useLogin } from '@/features/auth/hooks/use-login';
import { cn } from '@/shared/lib/utils';
import { RequiredLabel } from '@/shared';
import { Button } from '@/shared/ui/shadcn/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/shadcn/form';
import { Input } from '@/shared/ui/shadcn/input';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
    const loginMutation = useLogin();

    const form = useForm<LoginRequest>({
        resolver: zodResolver(LoginRequestSchema),
        mode: 'onChange',
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginRequest) => {
        loginMutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                autoComplete="on"
                className={cn('flex flex-col gap-6', className)}
                {...props}
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Вход</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Введите имя пользователя ниже, чтобы войти в свою учетную запись
                    </p>
                </div>
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <RequiredLabel required>Имя пользователя</RequiredLabel>
                                <FormControl>
                                    <Input
                                        type="username"
                                        placeholder="Введите имя пользователя"
                                        autoComplete="username"
                                        className={loginMutation.isError ? 'border-destructive' : ''}
                                        {...field}
                                    />
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
                                <RequiredLabel required>Пароль</RequiredLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Введите ваш пароль"
                                        autoComplete="current-password"
                                        className={loginMutation.isError ? 'border-destructive' : ''}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? 'Входим...' : 'Войти'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
