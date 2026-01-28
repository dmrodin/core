'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { applySavedTheme } from '@/shared/lib/apply-theme';

export function ThemeColorLoader() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
        applySavedTheme(theme);
    }, [resolvedTheme]);

    return null;
}
