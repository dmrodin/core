'use client';

import React from 'react';

import { Check, LoaderCircle, Search } from 'lucide-react';

import {
    Button,
    Input,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    cn,
} from '@/shared';

export interface MobileSearchOption {
    description?: string;
    label: string;
    value: string;
}

interface MobileSearchSheetProps {
    emptyText: string;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    onListScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
    onOpenChange: (open: boolean) => void;
    onSearchChange: (value: string) => void;
    onValueChange: (value: string) => void;
    open: boolean;
    options: MobileSearchOption[];
    searchPlaceholder: string;
    searchValue: string;
    title: string;
    trigger: React.ReactNode;
    value?: string;
}

export function MobileSearchSheet({
    emptyText,
    isLoading = false,
    isLoadingMore = false,
    onListScroll,
    onOpenChange,
    onSearchChange,
    onValueChange,
    open,
    options,
    searchPlaceholder,
    searchValue,
    title,
    trigger,
    value,
}: MobileSearchSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent
                side="bottom"
                className="h-[min(82dvh,42rem)] max-h-[calc(100dvh-0.5rem)] gap-0 overflow-hidden rounded-t-2xl p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="shrink-0 border-b pb-3 pr-12">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription className="sr-only">Найдите и выберите значение из списка</SheetDescription>
                </SheetHeader>

                <div className="shrink-0 border-b bg-background p-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-11 pl-9 text-base"
                            inputMode="search"
                        />
                    </div>
                </div>

                <div
                    data-slot="mobile-search-results"
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[calc(1rem+env(safe-area-inset-bottom))]"
                    onScroll={onListScroll}
                >
                    {isLoading ? (
                        <div className="flex h-24 items-center justify-center text-muted-foreground">
                            <LoaderCircle className="size-5 animate-spin" />
                        </div>
                    ) : options.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
                    ) : (
                        <div className="space-y-1">
                            {options.map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    variant="ghost"
                                    className={cn(
                                        'h-auto min-h-12 w-full justify-start gap-3 whitespace-normal px-3 py-2 text-left',
                                        option.value === value && 'bg-accent',
                                    )}
                                    onClick={() => {
                                        onValueChange(option.value);
                                        onOpenChange(false);
                                    }}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">{option.label}</span>
                                        {option.description && (
                                            <span className="block truncate text-xs font-normal text-muted-foreground">
                                                {option.description}
                                            </span>
                                        )}
                                    </span>
                                    <Check
                                        className={cn(
                                            'size-4 shrink-0 text-primary',
                                            option.value === value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                </Button>
                            ))}
                        </div>
                    )}

                    {isLoadingMore && (
                        <div className="flex justify-center py-3 text-muted-foreground">
                            <LoaderCircle className="size-5 animate-spin" />
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
