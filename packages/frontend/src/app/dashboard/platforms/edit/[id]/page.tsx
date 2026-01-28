'use client';

import { use } from 'react';

import { usePlatformById } from '@/entities/platform';
import { PlatformForm } from '@/features/platforms/ui/platform-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditPlatformPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: platform, isLoading } = usePlatformById(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (!platform) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Платформа не найдена</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать платформу</CardTitle>
                    <CardDescription>Измените данные платформы.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PlatformForm isEdit initialData={platform} />
                </CardContent>
            </Card>
        </div>
    );
}
