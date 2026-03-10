'use client';

import React from 'react';

import { Copy } from 'lucide-react';

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

    return (
        <Card className="w-full my-4">
            <CardHeader className="flex flex-col lg:flex-row lg:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold">№{application.id}</div>
                    <Badge
                        variant={application.status === 'open' ? 'success' : 'destructive'}
                        className="font-semibold"
                    >
                        {formatNumber(application.amount)} | {application.currency.code}
                    </Badge>
                    <Badge variant={application.status === 'open' ? 'success' : 'destructive'}>
                        {application.status === 'open' ? 'В РАБОТЕ' : 'ЗАВЕРШЕНА'}
                    </Badge>
                    <Badge variant="outline">{application.operation_type.name}</Badge>
                </div>
                <div className="flex justify-end">
                    <span>
                        <strong>Создан:</strong>{' '}
                        <span className="block lg:inline">{formatDateTime(application.createdAt)}</span>
                    </span>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col">
                <p>
                    <strong className="mr-1">Исполнитель:</strong>
                    <span className="block lg:inline">{application.assignee_user.username}</span>
                </p>
                <p>
                    <strong className="mr-1">Дата встречи:</strong>
                    <span className="block lg:inline">{formatDateTime(application.meetingDate)}</span>
                </p>
                {application.telegramUsername && (
                    <p>
                        <strong className="mr-1">Telegram:</strong>
                        <span
                            className="block lg:inline text-primary cursor-pointer"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyHandler(application.telegramUsername!);
                            }}
                        >
                            {application.telegramUsername}
                        </span>
                    </p>
                )}
                {application.phone && (
                    <p>
                        <strong className="mr-1">Телефон:</strong>
                        <span
                            className="block lg:inline text-primary cursor-pointer"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyHandler(application.phone!);
                            }}
                        >
                            {application.phone}
                        </span>
                    </p>
                )}
                {hasAdvanceEntries && (
                    <div className="mt-3 rounded border border-primary/40 bg-primary/10 p-2">
                        <p className="text-sm">
                            <strong className="mr-1">Аванс:</strong>
                            <span className="font-semibold">{advanceLabel}</span>
                        </p>
                    </div>
                )}
                {!hasAdvanceEntries && application.advance && application.advance.amount > 0 && (
                    <div className="mt-3 rounded border border-primary/40 bg-primary/10 p-2">
                        <p className="text-sm">
                            <strong className="mr-1">Аванс:</strong>
                            <span className="font-semibold">
                                +{formatNumber(application.advance.amount)} {application.advance.currency}
                            </span>
                        </p>
                    </div>
                )}
            </CardContent>

            {application.description && (
                <CardFooter className="flex justify-between items-start gap-2">
                    <p className="flex-1">
                        <strong className="mr-1">Описание:</strong>
                        <span className="block lg:inline">{application.description}</span>
                    </p>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0"
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
