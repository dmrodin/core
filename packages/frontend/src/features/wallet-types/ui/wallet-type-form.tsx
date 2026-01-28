'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
    CreateWalletTypeRequest,
    CreateWalletTypeSchema,
    UpdateWalletTypeRequest,
    UpdateWalletTypeSchema,
    WalletType,
} from '@/entities/wallet-type/model/wallet-type-schemas';
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
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Switch } from '@/shared/ui/shadcn/switch';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

import { useCreateWalletType } from '../hooks/use-create-wallet-type';
import { useUpdateWalletType } from '../hooks/use-update-wallet-type';

const SYSTEM_WALLET_TYPE_CODES = ['inskech', 'bet11', 'vnj'];

interface WalletTypeFormProps {
    isEdit?: boolean;
    initialData?: WalletType;
}

export function WalletTypeForm({ isEdit = false, initialData }: WalletTypeFormProps) {
    const router = useRouter();
    const createMutation = useCreateWalletType();
    const updateMutation = useUpdateWalletType();

    const form = useForm<CreateWalletTypeRequest | UpdateWalletTypeRequest>({
        resolver: zodResolver(isEdit ? UpdateWalletTypeSchema : CreateWalletTypeSchema),
        defaultValues:
            isEdit && initialData
                ? {
                      code: initialData.code,
                      name: initialData.name,
                      description: initialData.description || '',
                      showInTabs: initialData.showInTabs,
                      tabOrder: initialData.tabOrder,
                      active: initialData.active,
                  }
                : {
                      code: '',
                      name: '',
                      active: true,
                  },
    });

    const onSubmit = async (data: CreateWalletTypeRequest | UpdateWalletTypeRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdateWalletTypeRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreateWalletTypeRequest);
        }
        router.push(ROUTER_MAP.WALLET_TYPES);
    };

    const mutation = isEdit ? updateMutation : createMutation;
    const isSystemType = isEdit && initialData && SYSTEM_WALLET_TYPE_CODES.includes(initialData.code);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Код <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="inskech" {...field} disabled={isSystemType} />
                            </FormControl>
                            {isSystemType && (
                                <FormDescription>Код системного типа кошелька нельзя изменить</FormDescription>
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
                                <Input placeholder="Инскеш" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Описание типа" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="showInTabs"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Показывать в табах</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tabOrder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Порядок в табах</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? undefined : parseInt(value, 10));
                                        }}
                                    />
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
                                    Активные типы кошельков доступны для выбора при создании кошельков
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
                        onClick={() => router.push(ROUTER_MAP.WALLET_TYPES)}
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
                              : 'Создать тип'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
