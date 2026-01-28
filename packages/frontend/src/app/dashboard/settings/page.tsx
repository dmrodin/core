import { Metadata } from 'next';

import { Card, CardDescription, CardHeader, CardTitle } from '@/shared';
import { Settings } from '@/shared/ui/components/settings';

export const metadata: Metadata = {
    title: 'Настройки',
};

export default function SettingsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Настройки</CardTitle>
                    <CardDescription>Настройте интерфейс под себя</CardDescription>
                </CardHeader>
            </Card>
            <Settings />
        </div>
    );
}
