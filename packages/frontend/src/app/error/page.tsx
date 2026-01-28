'use client';

import { Fragment } from 'react';

import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

const PageTransition = dynamic(() => import('@/shared/ui/components/page-transition'), {
    ssr: false,
});

export default function ErrorPage() {
    return (
        <Fragment>
            <Head>
                <title>Произошла ошибка</title>
            </Head>
            <PageTransition>
                <div className="flex min-h-[calc(100dvh-0px)] items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-xl text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex items-center justify-center rounded-full ">
                                <AlertCircle className="h-12 w-12" color="red" />
                            </div>
                            <CardTitle className="text-2xl">Произошла ошибка</CardTitle>
                            <CardDescription>Извините, произошла непредвиденная ошибка</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Button asChild>
                                    <Link href={ROUTER_MAP.DASHBOARD}>Вернуться в панель управления</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageTransition>
        </Fragment>
    );
}
