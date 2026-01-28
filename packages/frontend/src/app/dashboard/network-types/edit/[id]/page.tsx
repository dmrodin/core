'use client';

import { use } from 'react';

import { useNetworkType } from '@/entities/network/model/use-network-type';
import { NetworkTypeForm } from '@/features/network/ui/network-type-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditNetworkTypePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: networkType, isLoading } = useNetworkType(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (!networkType) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Тип сети не найден</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать тип сети</CardTitle>
                    <CardDescription>Измените данные типа сети.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NetworkTypeForm isEdit initialData={networkType} />
                </CardContent>
            </Card>
        </div>
    );
}
