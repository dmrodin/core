'use client';

import { useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GetGuidesParamsRequest, GetGuidesParamsSchema } from '@/entities/guides/model/guide-schemas';
import { cn } from '@/shared/lib/utils';
import { Form, FormControl, FormField, FormItem } from '@/shared/ui/shadcn/form';
import { Input } from '@/shared/ui/shadcn/input';

export function GuidesFilters({
    className,
    onFiltersChange,
    ...props
}: React.ComponentProps<'div'> & {
    onFiltersChange?: (filters: Partial<GetGuidesParamsRequest>) => void;
}) {
    const form = useForm<z.input<typeof GetGuidesParamsSchema>>({
        resolver: zodResolver(GetGuidesParamsSchema),
        defaultValues: {
            search: '',
            sortField: 'createdAt',
            sortOrder: 'desc',
            page: 1,
            limit: 10,
        },
    });

    const search = form.watch('search');
    const prevValues = useRef({ search });

    useEffect(() => {
        const current = {
            search,
            sortField: 'createdAt' as const,
            sortOrder: 'desc' as const,
        };
        if (JSON.stringify(prevValues.current) !== JSON.stringify({ search: prevValues.current.search })) {
            onFiltersChange?.(current);
            prevValues.current = { search };
        }
    }, [search, onFiltersChange]);

    return (
        <div className={cn('w-64', className)} {...props}>
            <Form {...form}>
                <form>
                    <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type="search"
                                            placeholder="Поиск..."
                                            {...field}
                                            className="pl-8 pr-8 [appearance:textfield] [&::-webkit-search-cancel-button]:appearance-none"
                                        />
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        {field.value && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                                                onClick={() => form.setValue('search', '')}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
}
