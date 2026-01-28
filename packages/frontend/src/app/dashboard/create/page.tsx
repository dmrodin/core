import { CreateUserForm } from '@/features/users/ui/create-users/create-user-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export default function CreateUserPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать пользователя</CardTitle>
                    <CardDescription>Введите данные, чтобы добавить нового пользователя</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateUserForm />
                </CardContent>
            </Card>
        </div>
    );
}
