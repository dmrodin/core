'use client';

import { Fragment } from 'react';

import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

import { Search } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

const PageTransition = dynamic(() => import('@/shared/ui/components/page-transition'), {
    ssr: false,
});

export default function NotFound() {
    return (
        <Fragment>
            <Head>
                <title>Страница не найдена</title>
            </Head>
            <PageTransition>
                <div className="flex min-h-[calc(100dvh-0px)] items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-xl text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex size-12 sm:size-14 items-center justify-center rounded-full bg-primary/10">
                                <Search className="size-6 sm:size-7 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Страница не найдена</CardTitle>
                            <CardDescription>
                                Похоже, такой страницы не существует или она была перемещена.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mx-auto mb-6 text-5xl sm:text-7xl font-bold leading-none tracking-tight text-muted-foreground/50">
                                404
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Button asChild>
                                    <Link href={ROUTER_MAP.DASHBOARD}>В панель управления</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageTransition>
        </Fragment>
    );
}
