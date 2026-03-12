'use client';

import React, { Fragment, useMemo, useState } from 'react';

import { CheckCircle2, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useBlockUser } from '@/features/users/hooks/use-block-user';
import { useDeleteUser } from '@/features/users/hooks/use-delete-user';
import { useInfiniteUsers } from '@/features/users/hooks/use-infinite-users';
import { useResetUserPassword } from '@/features/users/hooks/use-reset-user-password';
import { useUpdateUserFlags } from '@/features/users/hooks/use-update-user-flags';
import { useUpdateUserRole } from '@/features/users/hooks/use-update-user-role';
import { useUsersQueryParams } from '@/features/users/hooks/use-users-query-param';
import { useLastItemObserver } from '@/shared/lib/hooks/use-last-Item-observer';
import { formatDateTime } from '@/shared/lib/utils';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog';
import {
    Button,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Input,
    Label,
    Loading,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared';

interface UsersTableProps {
    showDeleted?: boolean;
}

export const UsersTable = ({ showDeleted = false }: UsersTableProps) => {
    const blockUserMutation = useBlockUser();
    const deleteUserMutation = useDeleteUser();
    const resetUserPasswordMutation = useResetUserPassword();
    const updateUserFlagsMutation = useUpdateUserFlags();
    const [openUserId, setOpenUserId] = useState<string | null>(null);
    const [resetDialogUser, setResetDialogUser] = useState<null | { id: string; username?: string }>(null);
    const [resetPassword, setResetPassword] = useState('');
    const [rolePopoverUser, setRolePopoverUser] = useState<null | {
        id: string;
        current: string;
    }>(null);
    const updateUserRoleMutation = useUpdateUserRole();
    const params = useUsersQueryParams();
    const safeParams = {
        ...params,
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        deleted: showDeleted ? true : undefined,
    };
    const { data: infiniteData, isLoading, fetchNextPage, hasNextPage } = useInfiniteUsers(safeParams);

    const users = useMemo(() => infiniteData?.pages.flatMap((page) => page.users) || [], [infiniteData]);

    const tableRow = ['Имя', 'Роль', 'Курьер', 'Держатель', 'Создан', 'Статус', 'Последний вход'];

    const lastUserRef = useLastItemObserver<HTMLTableRowElement>(
        () => {
            fetchNextPage();
        },
        isLoading,
        hasNextPage,
    );

    if (isLoading) {
        return <Loading />;
    }

    const generatePassword = (length = 12) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < length; i += 1) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    return (
        <Fragment>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {tableRow.map((h) => (
                                <TableHead key={h}>{h}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="p-0">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Users />
                                            </EmptyMedia>
                                            <EmptyContent>
                                                <EmptyTitle>Пользователей не найдено</EmptyTitle>
                                                <EmptyDescription>
                                                    Попробуйте изменить параметры поиска или создайте нового
                                                    пользователя.
                                                </EmptyDescription>
                                            </EmptyContent>
                                        </EmptyHeader>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => {
                                const isLast = index === users.length - 1;
                                return (
                                    <Popover
                                        key={user.id}
                                        open={openUserId === user.id}
                                        onOpenChange={(open) => setOpenUserId(open ? user.id : null)}
                                    >
                                        <PopoverTrigger asChild>
                                            <TableRow
                                                ref={isLast ? lastUserRef : null}
                                                className="cursor-pointer hover:bg-muted/50 transition"
                                                onClick={() => setOpenUserId(openUserId === user.id ? null : user.id)}
                                            >
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>
                                                    {user.roles && Array.isArray(user.roles) && user.roles.length > 0
                                                        ? user.roles.map((r) => r.name).join(', ')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {user.isCourier ? (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Да</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-muted-foreground">Нет</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {user.isHolder ? (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Да</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-muted-foreground">Нет</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.createdAt ? formatDateTime(user.createdAt) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.blocked
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {user.blocked ? 'Заблокирован' : 'Активен'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'Не был в сети'}
                                                </TableCell>
                                            </TableRow>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-48 p-0 z-50">
                                            <div className="flex flex-col divide-y">
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start"
                                                    disabled={blockUserMutation.isPending}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        blockUserMutation.mutate({
                                                            id: user.id,
                                                            blocked: !user.blocked,
                                                        });
                                                        setOpenUserId(null);
                                                    }}
                                                >
                                                    {user.blocked ? 'Разблокировать' : 'Заблокировать'}
                                                </Button>
                                                <Popover
                                                    open={!!rolePopoverUser && rolePopoverUser.id === user.id}
                                                    onOpenChange={(open) => {
                                                        if (!open) setRolePopoverUser(null);
                                                    }}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="justify-start"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRolePopoverUser({
                                                                    id: user.id,
                                                                    current: user.roles?.[0]?.code || 'user',
                                                                });
                                                            }}
                                                        >
                                                            Обновить роль
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start" className="w-56 p-4 z-50">
                                                        <div className="flex flex-col gap-3">
                                                            <div className="font-medium mb-1">Выберите роль:</div>
                                                            {[
                                                                { value: 'admin', label: 'Админ' },
                                                                { value: 'moderator', label: 'Модератор' },
                                                                { value: 'user', label: 'Пользователь' },
                                                            ].map((role) => (
                                                                <label
                                                                    key={role.value}
                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`user-role-${user.id}`}
                                                                        value={role.value}
                                                                        checked={
                                                                            rolePopoverUser?.current === role.value
                                                                        }
                                                                        onChange={() =>
                                                                            setRolePopoverUser(
                                                                                (prev) =>
                                                                                    prev && {
                                                                                        ...prev,
                                                                                        current: role.value,
                                                                                    },
                                                                            )
                                                                        }
                                                                    />
                                                                    <span>{role.label}</span>
                                                                </label>
                                                            ))}
                                                            <div className="flex gap-2 mt-2 justify-end">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setRolePopoverUser(null)}
                                                                >
                                                                    Отмена
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    disabled={updateUserRoleMutation.isPending}
                                                                    onClick={() => {
                                                                        if (rolePopoverUser) {
                                                                            updateUserRoleMutation.mutate({
                                                                                id: user.id,
                                                                                roleCodes: [rolePopoverUser.current],
                                                                            });
                                                                        }
                                                                        setRolePopoverUser(null);
                                                                        setOpenUserId(null);
                                                                    }}
                                                                >
                                                                    {updateUserRoleMutation.isPending
                                                                        ? 'Сохраняем...'
                                                                        : 'Сохранить'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setResetDialogUser({ id: user.id, username: user.username });
                                                        setResetPassword('');
                                                        setOpenUserId(null);
                                                    }}
                                                >
                                                    Сбросить пароль
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start"
                                                    disabled={updateUserFlagsMutation.isPending}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateUserFlagsMutation.mutate({
                                                            id: user.id,
                                                            isHolder: !user.isHolder,
                                                        });
                                                        setOpenUserId(null);
                                                    }}
                                                >
                                                    {user.isHolder ? 'Убрать держателя' : 'Сделать держателем'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start"
                                                    disabled={updateUserFlagsMutation.isPending}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateUserFlagsMutation.mutate({
                                                            id: user.id,
                                                            isCourier: !user.isCourier,
                                                        });
                                                        setOpenUserId(null);
                                                    }}
                                                >
                                                    {user.isCourier ? 'Убрать курьера' : 'Сделать курьером'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start"
                                                    disabled={updateUserFlagsMutation.isPending}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateUserFlagsMutation.mutate({
                                                            id: user.id,
                                                            telegramNotifications: !user.telegramNotifications,
                                                        });
                                                        setOpenUserId(null);
                                                    }}
                                                >
                                                    {user.telegramNotifications
                                                        ? 'Выключить уведомления'
                                                        : 'Включить уведомления'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteUserMutation.mutate({ id: user.id });
                                                        setOpenUserId(null);
                                                    }}
                                                >
                                                    Удалить пользователя
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog
                open={!!resetDialogUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setResetDialogUser(null);
                        setResetPassword('');
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg md:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Сброс пароля</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="reset-password">
                            Новый пароль{resetDialogUser?.username ? ` для ${resetDialogUser.username}` : ''}
                        </Label>
                        <Input
                            id="reset-password"
                            type="text"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder="Введите новый пароль"
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setResetPassword(generatePassword())}
                            >
                                Сгенерировать
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setResetPassword('')}>
                                Очистить
                            </Button>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setResetDialogUser(null);
                                setResetPassword('');
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            disabled={resetUserPasswordMutation.isPending}
                            onClick={async () => {
                                if (!resetDialogUser) return;
                                if (!resetPassword || resetPassword.length < 8) {
                                    toast.error('Пароль должен содержать минимум 8 символов');
                                    return;
                                }
                                await resetUserPasswordMutation.mutateAsync({
                                    id: resetDialogUser.id,
                                    password: resetPassword,
                                });
                                setResetDialogUser(null);
                                setResetPassword('');
                            }}
                        >
                            {resetUserPasswordMutation.isPending ? 'Сохраняем...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
};
