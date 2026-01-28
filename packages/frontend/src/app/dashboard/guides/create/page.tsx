import { GuideForm } from '@/features/guides/ui/guide-form/guide-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export default function CreateGuidePage() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать справочник</CardTitle>
                    <CardDescription>Заполните все необходимые поля ниже.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GuideForm />
                </CardContent>
            </Card>
        </div>
    );
}
