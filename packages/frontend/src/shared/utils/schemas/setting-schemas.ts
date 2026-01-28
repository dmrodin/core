import { z } from 'zod';

import { DEFAULT_THEME } from '@/shared/utils/constants/settings-theme';

export const settingsSchema = z.object(
    Object.fromEntries(Object.keys(DEFAULT_THEME.light).map((key) => [key, z.string()])),
);

export type SettingsFormValues = z.infer<typeof settingsSchema>;
