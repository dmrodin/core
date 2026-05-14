'use client';

import { useMemo } from 'react';

import { calcRoutes, formatPctRu, formatUsdtRu, useBankRates, useTajikRates } from '@/entities/parser-rates';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/shadcn/card';

export function DashboardP2PDc() {
    const { data: tajik, isError: tajikError } = useTajikRates();
    const { data: bank } = useBankRates();

    const view = useMemo(() => {
        if (!tajik) return null;
        const { p2p, dcs, bestValue } = calcRoutes(tajik, bank);
        if (p2p === null && dcs.length === 0) return null;
        return { p2p, dcs, bestValue };
    }, [tajik, bank]);

    if (tajikError || !view) return null;

    const colorFor = (value: number | null): string => {
        if (value === null || view.bestValue === null) return '';
        return value === view.bestValue ? 'text-success' : 'text-destructive';
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2">
                {view.p2p !== null && (
                    <Card className="w-fit flex-shrink-0 !gap-0 !p-0">
                        <CardContent className="flex items-baseline gap-1.5 !px-2.5 !py-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">P2P</span>
                            <span className={cn('text-sm leading-none font-semibold', colorFor(view.p2p))}>
                                {formatUsdtRu(view.p2p)} USDT
                            </span>
                        </CardContent>
                    </Card>
                )}
                {view.dcs.map((dc) => (
                    <Card key={dc.label} className="w-fit flex-shrink-0 !gap-0 !p-0">
                        <CardContent className="flex items-baseline gap-1.5 !px-2.5 !py-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                DC {dc.label}
                            </span>
                            <span className={cn('text-sm leading-none font-semibold', colorFor(dc.value))}>
                                {formatUsdtRu(dc.value)} USDT
                            </span>
                            {dc.deviationPct !== null && (
                                <span
                                    className={cn(
                                        'text-[10px] leading-none font-medium',
                                        dc.deviationPct >= 0 ? 'text-success' : 'text-destructive',
                                    )}
                                >
                                    {formatPctRu(dc.deviationPct)}
                                </span>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
