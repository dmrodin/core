'use client';

import { useMemo } from 'react';

import { calcRoutes, formatUsdtRu, useTajikRates } from '@/entities/parser-rates';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/shadcn/card';

export function DashboardP2PDc() {
    const { data, isError } = useTajikRates();

    const view = useMemo(() => {
        if (!data) return null;
        const { p2p, dc, allPresent } = calcRoutes(data);
        if (p2p === null && dc === null) return null;

        let p2pClass = '';
        let dcClass = '';
        if (allPresent && p2p !== null && dc !== null) {
            if (p2p > dc) {
                p2pClass = 'text-success';
                dcClass = 'text-destructive';
            } else {
                p2pClass = 'text-destructive';
                dcClass = 'text-success';
            }
        }

        return { p2p, dc, p2pClass, dcClass };
    }, [data]);

    if (isError || !view) return null;

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2">
                {view.p2p !== null && (
                    <Card className="w-fit flex-shrink-0 !gap-0 !p-0">
                        <CardContent className="flex items-baseline gap-1.5 !px-2.5 !py-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">P2P</span>
                            <span className={cn('text-sm leading-none font-semibold', view.p2pClass)}>
                                {formatUsdtRu(view.p2p)} USDT
                            </span>
                        </CardContent>
                    </Card>
                )}
                {view.dc !== null && (
                    <Card className="w-fit flex-shrink-0 !gap-0 !p-0">
                        <CardContent className="flex items-baseline gap-1.5 !px-2.5 !py-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">DC</span>
                            <span className={cn('text-sm leading-none font-semibold', view.dcClass)}>
                                {formatUsdtRu(view.dc)} USDT
                            </span>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
