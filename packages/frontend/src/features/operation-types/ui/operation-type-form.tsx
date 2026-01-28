'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
    CreateOperationTypeRequest,
    CreateOperationTypeSchema,
    OperationType,
    UpdateOperationTypeRequest,
    UpdateOperationTypeSchema,
} from '@/entities/operations/model/operation-type-schemas';
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
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

import { useCreateOperationType } from '../hooks/use-create-operation-type';
import { useUpdateOperationType } from '../hooks/use-update-operation-type';

interface OperationTypeFormProps {
    isEdit?: boolean;
    initialData?: OperationType;
}

export function OperationTypeForm({ isEdit = false, initialData }: OperationTypeFormProps) {
    const router = useRouter();
    const createMutation = useCreateOperationType();
    const updateMutation = useUpdateOperationType();

    const form = useForm<CreateOperationTypeRequest | UpdateOperationTypeRequest>({
        resolver: zodResolver(isEdit ? UpdateOperationTypeSchema : CreateOperationTypeSchema),
        defaultValues:
            isEdit && initialData
                ? {
                      code: initialData.code,
                      name: initialData.name,
                      description: initialData.description || '',
                      isSeparateTab: initialData.isSeparateTab,
                      active: initialData.active,
                  }
                : {
                      code: '',
                      name: '',
                      description: '',
                      isSeparateTab: false,
                      active: true,
                  },
    });

    const onSubmit = async (data: CreateOperationTypeRequest | UpdateOperationTypeRequest) => {
        if (isEdit && initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: data as UpdateOperationTypeRequest,
            });
        } else {
            await createMutation.mutateAsync(data as CreateOperationTypeRequest);
        }
        router.push(ROUTER_MAP.OPERATION_TYPES);
    };

    const mutation = isEdit ? updateMutation : createMutation;

    const isSystemType = isEdit && initialData ? initialData.isSystem : false;

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
                                <Input placeholder="deposit" {...field} disabled={isSystemType} />
                            </FormControl>
                            <FormDescription>
                                {isSystemType
                                    ? 'Код системного типа операции нельзя изменить'
                                    : 'Уникальный код типа операции (только латиница, цифры, дефис, подчеркивание)'}
                            </FormDescription>
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
                                <Input placeholder="Пополнение" {...field} />
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
                                <Textarea placeholder="Описание типа операции" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isSeparateTab"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Отображать как отдельный таб</FormLabel>
                                <FormDescription>
                                    Если включено, этот тип операции будет отображаться как отдельная вкладка на
                                    странице операций.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
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
                                    Активные типы операций доступны для выбора при создании операций и заявок
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
                        onClick={() => router.push(ROUTER_MAP.OPERATION_TYPES)}
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
                              : 'Создать тип операции'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
