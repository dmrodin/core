'use client';

import { use } from 'react';

import { useNetwork } from '@/entities/network/model/use-network';
import { NetworkForm } from '@/features/network/ui/network-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditNetworkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: network, isLoading } = useNetwork(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (!network) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Сеть не найдена</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать сеть</CardTitle>
                    <CardDescription>Измените данные сети.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NetworkForm isEdit initialData={network} />
                </CardContent>
            </Card>
        </div>
    );
}
