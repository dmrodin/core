import { DEFAULT_THEME } from '@/shared/utils/constants/settings-theme';

export function applySavedTheme(theme?: 'light' | 'dark' | null) {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    let currentTheme: 'light' | 'dark';
    if (theme) {
        currentTheme = theme;
    } else {
        const isDark = root.classList.contains('dark');
        currentTheme = isDark ? 'dark' : 'light';
    }

    Object.keys(DEFAULT_THEME.light).forEach((key) => {
        root.style.removeProperty(`--${key}`);
    });

    Object.keys(DEFAULT_THEME[currentTheme]).forEach((key) => {
        const savedValue = localStorage.getItem(`${currentTheme}-${key}-color`);
        if (savedValue) {
            root.style.setProperty(`--${key}`, savedValue);
        }
    });
}
