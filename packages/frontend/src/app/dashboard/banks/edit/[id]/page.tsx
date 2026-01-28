'use client';

import { useParams } from 'next/navigation';

import { useBankById } from '@/entities/bank/model/use-bank-by-id';
import { BankForm } from '@/features/banks/ui/bank-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function BankEditPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: bankData, isLoading } = useBankById(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (!bankData) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Банк не найден</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать банк</CardTitle>
                    <CardDescription>Измените данные банка.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BankForm isEdit initialData={bankData} />
                </CardContent>
            </Card>
        </div>
    );
}
