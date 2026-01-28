import { z } from 'zod';

export const PlatformSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
    active: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const GetPlatformsResponseSchema = z.object({
    platforms: z.array(PlatformSchema),
});

export const CreatePlatformSchema = z.object({
    name: z
        .string({ message: 'Название обязательно' })
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(100, 'Название не должно превышать 100 символов'),
    code: z
        .string({ message: 'Код обязателен' })
        .min(2, 'Код должен содержать минимум 2 символа')
        .max(20, 'Код не должен превышать 20 символов'),
    active: z.boolean().default(true),
});

export const UpdatePlatformSchema = CreatePlatformSchema.partial();

export type Platform = z.infer<typeof PlatformSchema>;
export type GetPlatformsResponse = z.infer<typeof GetPlatformsResponseSchema>;
export type CreatePlatformRequest = z.infer<typeof CreatePlatformSchema>;
export type UpdatePlatformRequest = z.infer<typeof UpdatePlatformSchema>;
