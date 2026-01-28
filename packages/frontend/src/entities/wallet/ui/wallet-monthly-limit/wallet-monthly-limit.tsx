'use client';

import { useWalletMonthlyLimit } from '@/entities/wallet/model/use-wallet-monthly-limit';
import { formatNumber } from '@/shared/lib/utils/format-number';
import { cn, Loading } from '@/shared';

interface WalletMonthlyLimitProps {
    walletId: string;
    currencyCode: string;
    limit: number;
}

export const WalletMonthlyLimit = ({ walletId, currencyCode, limit }: WalletMonthlyLimitProps) => {
    const { data, isLoading } = useWalletMonthlyLimit(walletId, true);

    if (isLoading) {
        return <Loading className="text-xs py-0" />;
    }

    if (!data || data.limit === null) {
        return null;
    }

    const remaining = data.remaining ?? 0;
    const spent = data.spent ?? 0;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

    const getColorClass = () => {
        if (remaining < 0) return 'text-destructive';
        if (percentage > 80) return 'text-orange-500';
        if (percentage > 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Лимит:</span>
                <span className="font-medium">
                    {formatNumber(spent)} / {formatNumber(limit)} {currencyCode}
                </span>
                <span className={cn('ml-auto font-semibold', getColorClass())}>
                    {formatNumber(remaining)} {currencyCode}
                </span>
            </div>
            {/* Прогресс-бар */}
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'h-full transition-all duration-300',
                        remaining < 0
                            ? 'bg-destructive'
                            : percentage > 80
                              ? 'bg-orange-500'
                              : percentage > 50
                                ? 'bg-yellow-600'
                                : 'bg-green-600',
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};
