'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
    CreatePlatformRequest,
    CreatePlatformSchema,
    Platform,
    UpdatePlatformRequest,
    UpdatePlatformSchema,
} from '@/entities/platform/model/platform-schemas';
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
import { Switch } from '@/shared/ui/shadcn/switch';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

import { useCreatePlatform } from '../hooks/use-create-platform';
import { useUpdatePlatform } from '../hooks/use-update-platform';

interface PlatformFormProps {
    isEdit?: boolean;
    initialData?: Platform;
}

export function PlatformForm({ isEdit = false, initialData }: PlatformFormProps) {
    const router = useRouter();
    const createMutation = useCreatePlatform();
    const updateMutation = useUpdatePlatform();

    const form = useForm<CreatePlatformRequest | UpdatePlatformRequest>({
        resolver: zodResolver(isEdit ? UpdatePlatformSchema : CreatePlatformSchema),
        defaultValues:
            isEdit && initialData
                ? {
                      code: initialData.code,
                      name: initialData.name,
                      active: initialData.active,
                  }
                : {
                      code: '',
                      name: '',
                      active: true,
                  },
    });

    const onSubmit = async (data: CreatePlatformRequest | UpdatePlatformRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdatePlatformRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreatePlatformRequest);
        }
        router.push(ROUTER_MAP.PLATFORMS);
    };

    const mutation = isEdit ? updateMutation : createMutation;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Название <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Bybit" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Код <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="BYBIT" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Активность</FormLabel>
                                <FormDescription>
                                    Активные платформы доступны для выбора при создании кошельков
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-4 md:flex-row md:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="md:w-fit"
                        onClick={() => router.push(ROUTER_MAP.PLATFORMS)}
                    >
                        Отмена
                    </Button>
                    <Button type="submit" className="md:w-fit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? isEdit
                                ? 'Сохранение...'
                                : 'Создание...'
                            : isEdit
                              ? 'Сохранить'
                              : 'Создать платформу'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
