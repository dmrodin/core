'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
    CreateCurrencyRequest,
    CreateCurrencySchema,
    Currency,
    UpdateCurrencyRequest,
    UpdateCurrencySchema,
} from '@/entities/currency/model/currency-schemas';
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

import { useCreateCurrency } from '../hooks/use-create-currency';
import { useUpdateCurrency } from '../hooks/use-update-currency';

interface CurrencyFormProps {
    isEdit?: boolean;
    initialData?: Currency;
}

export function CurrencyForm({ isEdit = false, initialData }: CurrencyFormProps) {
    const router = useRouter();
    const createMutation = useCreateCurrency();
    const updateMutation = useUpdateCurrency();

    const form = useForm<CreateCurrencyRequest | UpdateCurrencyRequest>({
        resolver: zodResolver(isEdit ? UpdateCurrencySchema : CreateCurrencySchema),
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

    const onSubmit = async (data: CreateCurrencyRequest | UpdateCurrencyRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdateCurrencyRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreateCurrencyRequest);
        }
        router.push(ROUTER_MAP.CURRENCIES);
    };

    const mutation = isEdit ? updateMutation : createMutation;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Код валюты <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="RUB" {...field} />
                            </FormControl>
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
                                <Input placeholder="Российский рубль" {...field} />
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
                                    Активные валюты доступны для выбора при создании кошельков и заявок
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
                        onClick={() => router.push(ROUTER_MAP.CURRENCIES)}
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
                              : 'Создать валюту'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
