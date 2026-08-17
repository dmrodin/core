'use client';

import React from 'react';

import { CalendarClock, Copy, MessageCircle, Phone, UserRound } from 'lucide-react';

import { copyHandler, formatDateTime } from '@/shared/lib/utils';
import { formatNumber } from '@/shared/lib/utils/format-number';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/shadcn/card';

import { ApplicationResponse } from '../../model/application-schemas';

interface CardApplicationProps {
    application: ApplicationResponse;
}

export const CardApplication = ({ application }: CardApplicationProps) => {
    const advanceEntries = application.advanceEntries ?? [];
    const advanceDebit = advanceEntries
        .filter((entry) => entry.direction === 'debit')
        .reduce((sum, entry) => sum + entry.amount, 0);
    const advanceCredit = advanceEntries
        .filter((entry) => entry.direction === 'credit')
        .reduce((sum, entry) => sum + entry.amount, 0);
    const hasAdvanceEntries = advanceEntries.length > 0 && (advanceDebit > 0 || advanceCredit > 0);
    const advanceCurrency = application.advance?.currency || application.currency.code;
    const advanceParts = [
        advanceDebit > 0 ? `-${formatNumber(advanceDebit)}` : null,
        advanceCredit > 0 ? `+${formatNumber(advanceCredit)}` : null,
    ].filter(Boolean);
    const advanceLabel = advanceParts.length ? `${advanceParts.join(' ')} ${advanceCurrency}` : '';
    const telegramUsername = application.telegramUsername?.replace(/^@/, '');

    return (
        <Card className="my-1 w-full gap-0 py-3 sm:my-4 sm:gap-6 sm:py-6">
            <CardHeader className="gap-2 px-3 pr-12 sm:gap-3 sm:px-6 sm:pr-16 lg:flex lg:flex-row lg:justify-between">
                <div className="min-w-0 space-y-1.5 sm:space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <div className="font-semibold">№{application.id}</div>
                        <Badge variant={application.status === 'open' ? 'success' : 'secondary'}>
                            {application.status === 'open' ? 'В работе' : 'Завершена'}
                        </Badge>
                        <Badge variant="outline" className="max-w-full truncate">
                            {application.operation_type.name}
                        </Badge>
                    </div>
                    <p className="text-xl font-bold leading-none tabular-nums sm:text-2xl">
                        {formatNumber(application.amount)}{' '}
                        <span className="text-sm font-semibold text-muted-foreground sm:text-base">
                            {application.currency.code}
                        </span>
                    </p>
                </div>
                <p className="hidden text-xs text-muted-foreground sm:block lg:text-right">
                    Создана {formatDateTime(application.createdAt)}
                </p>
            </CardHeader>

            <CardContent className="mt-2 flex flex-col gap-2 px-3 text-xs sm:mt-4 sm:gap-3 sm:px-6 sm:text-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <p className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                        <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
                        <span className="truncate">{application.assignee_user.username}</span>
                    </p>
                    <p className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
                        <span className="whitespace-nowrap">{formatDateTime(application.meetingDate)}</span>
                    </p>
                </div>

                {(telegramUsername || application.phone) && (
                    <div className="flex flex-wrap gap-2">
                        {telegramUsername && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 min-w-0 flex-1 px-2 text-xs sm:h-11 sm:flex-none sm:px-3 sm:text-sm"
                            >
                                <a
                                    href={`https://t.me/${telegramUsername}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onPointerDown={(event) => event.stopPropagation()}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="truncate">@{telegramUsername}</span>
                                </a>
                            </Button>
                        )}
                        {application.phone && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 min-w-0 flex-1 px-2 text-xs sm:h-11 sm:flex-none sm:px-3 sm:text-sm"
                            >
                                <a href={`tel:${application.phone}`} onPointerDown={(event) => event.stopPropagation()}>
                                    <Phone className="h-4 w-4" />
                                    <span className="truncate">{application.phone}</span>
                                </a>
                            </Button>
                        )}
                    </div>
                )}

                {hasAdvanceEntries && (
                    <div className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 sm:rounded-lg sm:px-3 sm:py-2">
                        <span className="text-muted-foreground">Аванс: </span>
                        <span className="font-semibold">{advanceLabel}</span>
                    </div>
                )}
                {!hasAdvanceEntries && application.advance && application.advance.amount > 0 && (
                    <div className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 sm:rounded-lg sm:px-3 sm:py-2">
                        <span className="text-muted-foreground">Аванс: </span>
                        <span className="font-semibold">
                            +{formatNumber(application.advance.amount)} {application.advance.currency}
                        </span>
                    </div>
                )}
            </CardContent>

            {application.description && (
                <CardFooter className="mt-2 items-start gap-2 px-3 sm:mt-3 sm:px-6">
                    <p className="line-clamp-1 min-w-0 flex-1 text-xs text-muted-foreground sm:line-clamp-2 sm:text-sm">
                        {application.description}
                    </p>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="hidden h-11 w-11 shrink-0 sm:inline-flex"
                        aria-label="Скопировать описание"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyHandler(application.description!);
                        }}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};
