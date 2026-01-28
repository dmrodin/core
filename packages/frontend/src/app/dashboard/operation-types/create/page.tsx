import { Metadata } from 'next';

import { OperationTypeForm } from '@/features/operation-types/ui/operation-type-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Создать тип операции',
};

export default function CreateOperationTypePage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать тип операции</CardTitle>
                    <CardDescription>Заполните форму, чтобы добавить новый тип операции.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OperationTypeForm />
                </CardContent>
            </Card>
        </div>
    );
}
