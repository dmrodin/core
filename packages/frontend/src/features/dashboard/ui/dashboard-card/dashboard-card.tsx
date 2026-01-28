'use client';

import React from 'react';

import type { Wallet, WalletCurrencyGroup } from '@/entities/wallet';
import { BankWalletCard } from '@/entities/wallet';
import { CryptoWalletCard } from '@/entities/wallet';
import { SimpleWalletCard } from '@/entities/wallet';
import { Card, CardContent } from '@/shared';
import { Loading } from '@/shared';

interface CardDashboardProps {
    isLoading: boolean;
    hasError: boolean;
    currencyGroups: WalletCurrencyGroup[];
}

export const CardDashboard = ({ isLoading, hasError, currencyGroups }: CardDashboardProps) => {
    const renderWalletCard = (wallet: Wallet) => {
        switch (wallet.walletKind) {
            case 'crypto':
                return <CryptoWalletCard key={wallet.id} wallet={wallet} />;
            case 'bank':
                return <BankWalletCard key={wallet.id} wallet={wallet} />;
            case 'simple':
                return <SimpleWalletCard key={wallet.id} wallet={wallet} />;
            default:
                return <SimpleWalletCard key={wallet.id} wallet={wallet} />;
        }
    };

    if (hasError) {
        return (
            <Card className="w-full">
                <CardContent className="p-4 text-sm text-destructive">
                    Не удалось загрузить список кошельков
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    const groupsWithWallets = currencyGroups.filter((group) => group.wallets.length > 0);

    if (groupsWithWallets.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {groupsWithWallets.map((group) => {
                const firstWallet = group.wallets[0];
                const currencyCode = firstWallet?.currency.code ?? group.currency.toUpperCase();
                const currencyName = firstWallet?.currency.name ?? currencyCode;

                return (
                    <section key={group.currency} className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{currencyName}</p>
                            <h2 className="text-base font-semibold uppercase tracking-wide sm:text-lg">
                                {currencyCode}
                            </h2>
                        </div>
                        <div className="space-y-1.5">{group.wallets.map((wallet) => renderWalletCard(wallet))}</div>
                    </section>
                );
            })}
        </div>
    );
};
