'use client';

import { useParams } from 'next/navigation';

import { useApplications } from '@/entities/application';
import { ApplicationForm } from '@/features/application';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditApplicationPage() {
    const params = useParams<{ id: string }>();
    const id = params.id ? parseInt(params.id, 10) : 0;
    const { data: application, isLoading, error } = useApplications(id);

    if (isLoading) return <Loading variant="page" />;
    if (error)
        return (
            <div className="max-w-5xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Ошибка загрузки заявки</CardTitle>
                        <CardDescription>Ошибка: {error.message}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );

    if (!application)
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Заявка не найдена</p>
                </div>
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать заявку</CardTitle>
                    <CardDescription>Измените все необходимые поля ниже.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ApplicationForm initialData={application} />
                </CardContent>
            </Card>
        </div>
    );
}
