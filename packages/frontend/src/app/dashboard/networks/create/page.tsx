import { Metadata } from 'next';

import { NetworkForm } from '@/features/network/ui/network-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Создать сеть',
};

export default function CreateNetworkPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать сеть</CardTitle>
                    <CardDescription>Заполните форму, чтобы добавить новую сеть.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NetworkForm />
                </CardContent>
            </Card>
        </div>
    );
}
