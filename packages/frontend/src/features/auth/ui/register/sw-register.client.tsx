'use client';

import { useEffect } from 'react';

import { isDevelopment } from '@/shared/lib/env-config';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('serviceWorker' in navigator)) return;

        if (isDevelopment) {
            return;
        }

        const register = async () => {
            try {
                await navigator.serviceWorker.register('/sw.js');
            } catch (error) {
                console.error(error);
            }
        };

        if (document.readyState === 'complete') {
            register();
        } else {
            window.addEventListener('load', register, { once: true });
        }

        return () => {
            window.removeEventListener('load', register);
        };
    }, []);

    return null;
}
