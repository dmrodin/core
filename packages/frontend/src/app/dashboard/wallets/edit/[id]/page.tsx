'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { WalletService } from '@/entities/wallet/api/wallet-service';
import { WalletForm } from '@/features/wallets/ui/wallet-form/wallet-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

interface EditWalletPageProps {
    params: Promise<{ id: string }>;
}

export default function EditWalletPage({ params }: EditWalletPageProps) {
    const router = useRouter();
    const { id } = use(params);

    const {
        data: wallet,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['wallet', id],
        queryFn: () => WalletService.getWalletById(id),
    });

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (error || !wallet) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-destructive mb-4">Ошибка загрузки кошелька</p>
                    <button onClick={() => router.push(ROUTER_MAP.WALLETS)} className="text-primary underline">
                        Вернуться к списку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать кошелек</CardTitle>
                    <CardDescription>Обновите информацию о кошельке.</CardDescription>
                </CardHeader>
                <CardContent>
                    <WalletForm initialData={wallet} walletId={id} />
                </CardContent>
            </Card>
        </div>
    );
}
