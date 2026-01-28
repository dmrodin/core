import { z } from 'zod';

export const SessionResponseDtoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    jti: z.string(),
    expiresAt: z.string().datetime(),
    revoked: z.boolean(),
    userAgent: z.string().nullable(),
    ip: z.string().nullable(),
    device: z.string().nullable(),
    browser: z.string().nullable(),
    os: z.string().nullable(),
    lastActivityAt: z.string().datetime(),
    isCurrent: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const GetSessionsResponseDtoSchema = z.object({
    sessions: z.array(SessionResponseDtoSchema),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    }),
});

export const DeactivateSessionsDtoSchema = z.object({
    excludeSessionId: z.string(),
});

export const DeactivateSessionsResponseDtoSchema = z.object({
    message: z.string(),
    deactivatedCount: z.number(),
});

export const DeactivateMySessionByldResponseDtoSchema = z.object({
    message: z.string(),
});

export type SessionResponseDto = z.infer<typeof SessionResponseDtoSchema>;
export type GetSessionsResponseDto = z.infer<typeof GetSessionsResponseDtoSchema>;
export type DeactivateSessionsDto = z.infer<typeof DeactivateSessionsDtoSchema>;
export type DeactivateSessionsResponseDto = z.infer<typeof DeactivateSessionsResponseDtoSchema>;
export type DeactivateMySessionByldResponseDto = z.infer<typeof DeactivateMySessionByldResponseDtoSchema>;
