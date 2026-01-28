import { Metadata } from 'next';

import { BankForm } from '@/features/banks/ui/bank-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Создать банк',
};

export default function CreateBankPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать банк</CardTitle>
                    <CardDescription>Заполните форму, чтобы добавить новый банк.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BankForm />
                </CardContent>
            </Card>
        </div>
    );
}
