import { Metadata } from 'next';

import { CreateUserForm } from '@/features/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared';

export const metadata: Metadata = {
    title: 'Создать пользователя',
};

export default function CreateUserPage() {
    return (
        <div className="space-y-6">
            <Card className="max-w-5xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Создать пользователя</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateUserForm />
                </CardContent>
            </Card>
        </div>
    );
}
