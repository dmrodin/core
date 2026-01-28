'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useNetworksList } from '@/entities/network/model/use-networks-list';
import {
    CreateNetworkTypeRequest,
    CreateNetworkTypeSchema,
    NetworkType,
    UpdateNetworkTypeRequest,
    UpdateNetworkTypeSchema,
} from '@/entities/network/model/network-type-schemas';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

import { useCreateNetworkType } from '../hooks/use-create-network-type';
import { useUpdateNetworkType } from '../hooks/use-update-network-type';

const SYSTEM_NETWORK_TYPE_CODES = ['trc-20'];

interface NetworkTypeFormProps {
    isEdit?: boolean;
    initialData?: NetworkType;
}

export function NetworkTypeForm({ isEdit = false, initialData }: NetworkTypeFormProps) {
    const router = useRouter();
    const createMutation = useCreateNetworkType();
    const updateMutation = useUpdateNetworkType();
    const { data: networksData, isLoading: networksLoading } = useNetworksList();

    const form = useForm<CreateNetworkTypeRequest | UpdateNetworkTypeRequest>({
        resolver: zodResolver(isEdit ? UpdateNetworkTypeSchema : CreateNetworkTypeSchema),
        defaultValues:
            isEdit && initialData
                ? {
                      networkId: initialData.networkId,
                      code: initialData.code,
                      name: initialData.name,
                      active: initialData.active,
                  }
                : {
                      networkId: '',
                      code: '',
                      name: '',
                      active: true,
                  },
    });

    const onSubmit = async (data: CreateNetworkTypeRequest | UpdateNetworkTypeRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdateNetworkTypeRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreateNetworkTypeRequest);
        }
        router.push(ROUTER_MAP.NETWORK_TYPES);
    };

    const mutation = isEdit ? updateMutation : createMutation;
    const isSystemNetworkType = isEdit && initialData && SYSTEM_NETWORK_TYPE_CODES.includes(initialData.code);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="networkId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Сеть <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Выберите сеть" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {networksLoading && (
                                        <SelectItem value="loading" disabled>
                                            Загрузка...
                                        </SelectItem>
                                    )}
                                    {networksData?.networks.map((network) => (
                                        <SelectItem key={network.id} value={network.id}>
                                            {network.code} — {network.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                Код типа <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="ERC-20" {...field} disabled={isSystemNetworkType} />
                            </FormControl>
                            {isSystemNetworkType && (
                                <FormDescription>Код системного типа сети нельзя изменить</FormDescription>
                            )}
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
                                <Input placeholder="ERC-20 Token Standard" {...field} />
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
                                    Активные типы сетей доступны для выбора при создании кошельков
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
                        onClick={() => router.push(ROUTER_MAP.NETWORK_TYPES)}
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
                              : 'Создать тип сети'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
