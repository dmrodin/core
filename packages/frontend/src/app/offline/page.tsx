'use client';

import { Fragment } from 'react';

import dynamic from 'next/dynamic';
import Head from 'next/head';

const PageTransition = dynamic(() => import('@/shared/ui/components/page-transition'), {
    ssr: false,
});

export default function OfflinePage() {
    return (
        <Fragment>
            <Head>
                <title>Вы офлайн</title>
            </Head>
            <PageTransition>
                <main className="flex min-h-[60vh] items-center justify-center p-6 text-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Вы офлайн</h1>
                        <p className="mt-2 text-muted-foreground">
                            Проверьте подключение к интернету и попробуйте снова.
                        </p>
                    </div>
                </main>
            </PageTransition>
        </Fragment>
    );
}
