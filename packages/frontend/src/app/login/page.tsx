'use client';

import { Fragment } from 'react';

import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';

import { LoginForm } from '@/features/auth';

const PageTransition = dynamic(() => import('@/shared/ui/components/page-transition'), {
    ssr: false,
});

export default function LoginPage() {
    return (
        <Fragment>
            <Head>
                <title>Вход</title>
            </Head>
            <PageTransition>
                <main className="grid min-h-svh lg:grid-cols-2">
                    <div className="flex flex-col gap-4 p-6 md:p-10">
                        <div className="flex justify-center gap-2 md:justify-start">
                            <a href="#" className="flex items-center gap-2 font-medium">
                                <div className=" text-primary-foreground flex size-6 items-center justify-center rounded-md">
                                    <Image src="/logo-circle.png" alt="Logo" height={25} width={25} />
                                </div>
                                MonteMove
                            </a>
                        </div>
                        <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-xs">
                                <LoginForm />
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden lg:block justify-items-center content-center bg-primary">
                        <Image
                            src="/picture-right.png"
                            alt="Image"
                            height={521}
                            width={479}
                            className="inset-0 object-cover rounded-full transition-all duration-300 dark:brightness-90 dark:contrast-95"
                        />
                    </div>
                </main>
            </PageTransition>
        </Fragment>
    );
}
