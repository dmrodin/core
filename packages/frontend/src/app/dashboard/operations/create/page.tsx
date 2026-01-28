import { OperationForm } from '@/features/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared';

export default function CreateOperationsPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать операцию</CardTitle>
                    <CardDescription>Заполните все необходимые поля ниже.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OperationForm />
                </CardContent>
            </Card>
        </div>
    );
}
