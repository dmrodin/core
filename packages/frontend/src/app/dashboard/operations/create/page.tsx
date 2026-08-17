import { OperationForm } from '@/features/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared';

export default function CreateOperationsPage() {
    return (
        <div className="mx-auto max-w-5xl">
            <Card className="gap-0 border-0 bg-transparent py-0 shadow-none sm:gap-6 sm:border sm:bg-card sm:py-6 sm:shadow-sm">
                <CardHeader className="hidden sm:grid">
                    <CardTitle className="text-2xl">Создать операцию</CardTitle>
                    <CardDescription>Заполните все необходимые поля ниже.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    <OperationForm />
                </CardContent>
            </Card>
        </div>
    );
}
