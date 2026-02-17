'use client';

import React, { Fragment, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { CheckCircle, Copy, FileText, Info, Pencil, RotateCcw, Trash } from 'lucide-react';

import {
    CardApplication,
    useApplicationsQueryParams,
    useCopyApplication,
    useDeleteApplication,
    useInfiniteApplications,
    useUpdateStatusApplication,
} from '@/entities/application';
import { OperationViewDialog } from '@/features/operations';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    ROUTER_MAP,
    Loading,
} from '@/shared';
import { useLastItemObserver } from '@/shared/lib/hooks/use-last-Item-observer';

export const InfiniteApplicationsList = () => {
    const router = useRouter();
    const params = useApplicationsQueryParams();
    const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null);

    const { data: infiniteData, isLoading, fetchNextPage, hasNextPage } = useInfiniteApplications(params);

    const { mutate: deleteApplicationMutation } = useDeleteApplication(params);
    const { mutate: updateStatuseApplicationMutation } = useUpdateStatusApplication();
    const { copyApplication } = useCopyApplication();

    const applications = useMemo(() => infiniteData?.pages.flatMap((page) => page.applications) || [], [infiniteData]);

    const lastApplicationRef = useLastItemObserver<HTMLDivElement>(fetchNextPage, isLoading, hasNextPage);

    return (
        <Fragment>
            {isLoading ? (
                <Loading />
            ) : applications.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FileText />
                        </EmptyMedia>
                        <EmptyContent>
                            <EmptyTitle>Заявки не найдены</EmptyTitle>
                            <EmptyDescription>
                                Нет заявок, соответствующих выбранным фильтрам. Создайте новую заявку.
                            </EmptyDescription>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            ) : (
                applications.map((app, index) => {
                    const isLast = index === applications.length - 1;
                    return (
                        <DropdownMenu key={app.id}>
                            <DropdownMenuTrigger asChild>
                                <div ref={isLast ? lastApplicationRef : null}>
                                    <CardApplication application={app} />
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="center"
                                className="w-40 bg-background shadow-md rounded-md text-foreground"
                            >
                                <DropdownMenuItem
                                    className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                    onClick={() => {
                                        if (app.status === 'done') {
                                            // Вернуть в работу
                                            updateStatuseApplicationMutation({
                                                id: app.id.toString(),
                                                status: 'open',
                                            });
                                        } else {
                                            router.push(
                                                `${ROUTER_MAP.OPERATIONS_CREATE}?applicationId=${app.id}&completeOnCreate=1`,
                                            );
                                        }
                                    }}
                                >
                                    {app.status == 'done' ? (
                                        <RotateCcw className="mr-2 h-4 w-4 text-primary" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                    )}{' '}
                                    {app.status == 'done' ? 'В работе' : 'Завершить'}
                                </DropdownMenuItem>
                                {app.operationId && (
                                    <DropdownMenuItem
                                        className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                        onClick={() => setSelectedOperationId(app.operationId)}
                                    >
                                        <Info className="mr-2 h-4 w-4 text-primary" /> Об операции
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                    onClick={() => router.push(ROUTER_MAP.APPLICATIONS_EDIT + '/' + app.id)}
                                >
                                    <Pencil className="mr-2 h-4 w-4 text-primary" /> Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                    onClick={() => copyApplication(app)}
                                >
                                    <Copy className="mr-2 h-4 w-4 text-primary" /> Копировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive/60 hover:text-destructive! hover:bg-destructive dark:hover:bg-destructive"
                                    onClick={() => deleteApplicationMutation(app.id)}
                                >
                                    <Trash className="mr-2 h-4 w-4 text-destructive/60" /> Удалить
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                })
            )}

            <OperationViewDialog
                operationId={selectedOperationId}
                open={!!selectedOperationId}
                onOpenChange={(open) => !open && setSelectedOperationId(null)}
            />
        </Fragment>
    );
};
