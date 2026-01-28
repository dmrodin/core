'use client';

import { use } from 'react';

import { useCurrencyById } from '@/entities/currency/model/use-currency-by-id';
import { CurrencyForm } from '@/features/currencies/ui/currency-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Loading } from '@/shared';

export default function EditCurrencyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: currency, isLoading } = useCurrencyById(id);

    if (isLoading) {
        return <Loading variant="page" />;
    }

    if (!currency) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Валюта не найдена</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Редактировать валюту</CardTitle>
                    <CardDescription>Измените данные валюты.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CurrencyForm isEdit initialData={currency} />
                </CardContent>
            </Card>
        </div>
    );
}
