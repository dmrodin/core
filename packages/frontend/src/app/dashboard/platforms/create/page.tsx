import { Metadata } from 'next';

import { PlatformForm } from '@/features/platforms/ui/platform-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Создать платформу',
};

export default function CreatePlatformPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать платформу</CardTitle>
                    <CardDescription>Заполните форму, чтобы добавить новую платформу.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PlatformForm />
                </CardContent>
            </Card>
        </div>
    );
}
