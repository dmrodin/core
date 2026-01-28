'use client';

import { useParams } from 'next/navigation';

import { useOperation } from '@/entities/operations';
import { OperationForm } from '@/features/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditOperationPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: operation, isLoading, isError } = useOperation(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (isError || !operation) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-destructive">Не удалось загрузить операцию</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать операцию</CardTitle>
                    <CardDescription>Измените необходимые поля ниже и сохраните изменения.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OperationForm initialData={operation} />
                </CardContent>
            </Card>
        </div>
    );
}
