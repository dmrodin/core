'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
    CreateNetworkRequest,
    CreateNetworkSchema,
    Network,
    UpdateNetworkRequest,
    UpdateNetworkSchema,
} from '@/entities/network/model/network-schemas';
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

import { useCreateNetwork } from '../hooks/use-create-network';
import { useUpdateNetwork } from '../hooks/use-update-network';

const SYSTEM_NETWORK_CODES = ['tron'];

interface NetworkFormProps {
    isEdit?: boolean;
    initialData?: Network;
}

export function NetworkForm({ isEdit = false, initialData }: NetworkFormProps) {
    const router = useRouter();
    const createMutation = useCreateNetwork();
    const updateMutation = useUpdateNetwork();

    const form = useForm<CreateNetworkRequest | UpdateNetworkRequest>({
        resolver: zodResolver(isEdit ? UpdateNetworkSchema : CreateNetworkSchema),
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

    const onSubmit = async (data: CreateNetworkRequest | UpdateNetworkRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdateNetworkRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreateNetworkRequest);
        }
        router.push(ROUTER_MAP.NETWORKS);
    };

    const mutation = isEdit ? updateMutation : createMutation;
    const isSystemNetwork = isEdit && initialData && SYSTEM_NETWORK_CODES.includes(initialData.code);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Код сети <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="BTC" {...field} disabled={isSystemNetwork} />
                            </FormControl>
                            {isSystemNetwork && <FormDescription>Код системной сети нельзя изменить</FormDescription>}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Название <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Bitcoin" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Активность</FormLabel>
                                <FormDescription>
                                    Активные сети доступны для выбора при создании кошельков
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
                        onClick={() => router.push(ROUTER_MAP.NETWORKS)}
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
                              : 'Создать сеть'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
