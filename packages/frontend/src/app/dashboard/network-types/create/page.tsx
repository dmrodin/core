import { Metadata } from 'next';

import { NetworkTypeForm } from '@/features/network/ui/network-type-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Создать тип сети',
};

export default function CreateNetworkTypePage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать тип сети</CardTitle>
                    <CardDescription>Заполните форму, чтобы добавить новый тип сети.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NetworkTypeForm />
                </CardContent>
            </Card>
        </div>
    );
}
