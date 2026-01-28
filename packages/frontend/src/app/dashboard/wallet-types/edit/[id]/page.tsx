'use client';

import { use } from 'react';

import { useWalletType } from '@/entities/wallet-type/model/use-wallet-type';
import { WalletTypeForm } from '@/features/wallet-types/ui/wallet-type-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditWalletTypePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: walletType, isLoading } = useWalletType(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (!walletType) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Тип кошелька не найден</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать тип кошелька</CardTitle>
                    <CardDescription>Измените данные типа кошелька.</CardDescription>
                </CardHeader>
                <CardContent>
                    <WalletTypeForm isEdit initialData={walletType} />
                </CardContent>
            </Card>
        </div>
    );
}
