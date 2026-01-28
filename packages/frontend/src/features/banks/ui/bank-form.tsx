'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
    CreateBankRequest,
    CreateBankSchema,
    Bank,
    UpdateBankRequest,
    UpdateBankSchema,
} from '@/entities/bank/model/bank-schemas';
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

import { useCreateBank } from '../hooks/use-create-bank';
import { useUpdateBank } from '../hooks/use-update-bank';

interface BankFormProps {
    isEdit?: boolean;
    initialData?: Bank;
}

export function BankForm({ isEdit = false, initialData }: BankFormProps) {
    const router = useRouter();
    const createMutation = useCreateBank();
    const updateMutation = useUpdateBank();

    const form = useForm<CreateBankRequest | UpdateBankRequest>({
        resolver: zodResolver(isEdit ? UpdateBankSchema : CreateBankSchema),
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

    const onSubmit = async (data: CreateBankRequest | UpdateBankRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdateBankRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreateBankRequest);
        }
        router.push(ROUTER_MAP.BANKS);
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
                                    <Input placeholder="Сбербанк" {...field} />
                                </FormControl>
                                <FormDescription>Полное название банка (например, Сбербанк)</FormDescription>
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
                                    <Input placeholder="SBER" {...field} />
                                </FormControl>
                                <FormDescription>Уникальный код банка (например, SBER)</FormDescription>
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
                                    Активные банки доступны для выбора при создании кошельков
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
                        onClick={() => router.push(ROUTER_MAP.BANKS)}
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
                              : 'Создать банк'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
