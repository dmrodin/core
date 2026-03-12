'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { UserRole } from '@/entities/users/model/user-schemas';
import { GuideForm } from '@/features/guides/ui/guide-form/guide-form';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { ROUTER_MAP } from '@/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export default function CreateGuidePage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isUserRole = user?.roles?.some((role) => role.code === UserRole.USER) ?? false;

    useEffect(() => {
        if (isUserRole) {
            router.replace(ROUTER_MAP.GUIDES);
        }
    }, [isUserRole, router]);

    if (isUserRole) {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Создать гайд</CardTitle>
                    <CardDescription>Заполните все необходимые поля ниже.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GuideForm />
                </CardContent>
            </Card>
        </div>
    );
}
