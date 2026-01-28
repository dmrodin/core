import { Metadata } from 'next';

import { WalletForm } from '@/features/wallets/ui/wallet-form/wallet-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Создать кошелек',
};

export default function CreateWalletPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать кошелек</CardTitle>
                    <CardDescription>Заполните форму, чтобы добавить новый кошелек.</CardDescription>
                </CardHeader>
                <CardContent>
                    <WalletForm />
                </CardContent>
            </Card>
        </div>
    );
}
