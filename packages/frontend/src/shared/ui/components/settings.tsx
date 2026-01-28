'use client';

import { useEffect } from 'react';

import { useTheme } from 'next-themes';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useDeactivateMySession, useDeactivateSessions, useSessions } from '@/entities/session/model/use-session';
import { applyThemeVars, formatDateSafe } from '@/shared/lib/utils';
import { ColorField } from '@/shared/ui/components/color-field';
import { Loading } from '@/shared/ui/components/loading';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Form } from '@/shared/ui/shadcn/form';
import { DEFAULT_THEME, THEME_GROUPS, THEME_LABELS } from '@/shared/utils/constants/settings-theme';
import { SettingsFormValues, settingsSchema } from '@/shared/utils/schemas/setting-schemas';

export function Settings() {
    const { resolvedTheme } = useTheme();
    const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: DEFAULT_THEME[currentTheme],
    });

    useEffect(() => {
        const saved = Object.fromEntries(
            Object.keys(DEFAULT_THEME[currentTheme]).map((key) => [
                key,
                localStorage.getItem(`${currentTheme}-${key}-color`) ?? DEFAULT_THEME[currentTheme][key],
            ]),
        );

        applyThemeVars(saved);
        form.reset(saved);
    }, [currentTheme, form]);

    const { data: sessionsData, isLoading } = useSessions();
    const deactivate = useDeactivateSessions();
    const deactivateMy = useDeactivateMySession();

    if (!sessionsData) return null;

    const handleDeactivateAll = () => {
        const currentSession = sessionsData.sessions.find((s) => s.isCurrent);

        if (!currentSession) {
            console.error('Не удалось определить текущую сессию');
            return;
        }

        deactivate.mutate({ excludeSessionId: currentSession.id });
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {Object.entries(THEME_GROUPS).map(([group, keys]) => (
                    <Card key={group} className="mb-2">
                        <CardHeader>
                            <CardTitle>{group}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid lg:grid-cols-4 gap-2">
                            {keys.map((key) => (
                                <ColorField
                                    key={key}
                                    name={key}
                                    label={THEME_LABELS[key] ?? key}
                                    value={form.watch(key as keyof SettingsFormValues)}
                                    onChange={(val) => {
                                        form.setValue(key as keyof SettingsFormValues, val);
                                        document.documentElement.style.setProperty(`--${key}`, val);
                                        localStorage.setItem(`${currentTheme}-${key}-color`, val);
                                    }}
                                />
                            ))}
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-end mb-0">
                    <Button
                        className="w-full"
                        type="button"
                        onClick={() => {
                            const theme = DEFAULT_THEME[currentTheme];
                            applyThemeVars(theme);
                            form.reset(theme);
                            Object.keys(theme).forEach((key) =>
                                localStorage.removeItem(`${currentTheme}-${key}-color`),
                            );
                        }}
                    >
                        Сбросить
                    </Button>
                </div>

                <Card className="mt-6 mb-4">
                    <CardHeader>
                        <CardTitle className="text-xl">Сессии</CardTitle>
                        <CardDescription>Здесь отображаются активные входы в систему</CardDescription>
                    </CardHeader>
                </Card>
                <div>
                    {isLoading && <Loading />}

                    {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                        <div>
                            {' '}
                            {sessionsData.sessions.map((session) => (
                                <Card
                                    key={session.id}
                                    className={`mt-2 ${session.isCurrent ? 'border-primary border-2' : ''}`}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CardTitle className="text-base">
                                                    {session.browser || 'Браузер'} • {session.device || 'Устройство'}
                                                </CardTitle>
                                                {session.isCurrent && (
                                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                                                        Текущая
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                {session.revoked ? (
                                                    <span className="text-xs text-destructive/60 font-medium">
                                                        Завершена
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-green-600 dark:text-green-500 font-medium">
                                                        Активна
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {session.os && (
                                            <CardDescription className="text-sm">{session.os}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">IP адрес:</span>
                                                <p className="font-medium break-all">
                                                    {session.ip?.replace('::ffff:', '') || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Последняя активность:</span>
                                                <p className="font-medium">{formatDateSafe(session.lastActivityAt)}</p>
                                            </div>
                                            <div className="lg:col-span-2">
                                                <span className="text-muted-foreground">Дата создания:</span>
                                                <p className="font-medium">{formatDateSafe(session.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-2 pt-3 border-t mt-1">
                                            <Button
                                                className="flex-1"
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deactivate.mutate({ excludeSessionId: session.id })}
                                                disabled={deactivate.isPending || session.isCurrent}
                                            >
                                                {deactivate.isPending ? 'Обработка...' : 'Завершить другие'}
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deactivateMy.mutate(session.id)}
                                                disabled={deactivateMy.isPending || session.isCurrent}
                                            >
                                                {deactivateMy.isPending ? 'Обработка...' : 'Завершить'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : !isLoading ? (
                        <p className="text-muted-foreground">Сессий нет</p>
                    ) : null}

                    {sessionsData?.sessions && sessionsData.sessions.length > 0 && (
                        <div className="mt-2">
                            <Button
                                className="w-full"
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={handleDeactivateAll}
                                disabled={deactivate.isPending}
                            >
                                {deactivate.isPending ? 'Обработка...' : 'Завершить все'}
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </Form>
    );
}
