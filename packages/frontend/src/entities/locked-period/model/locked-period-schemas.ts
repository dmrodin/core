import { z } from 'zod';

export const LockedPeriodSchema = z.object({
    id: z.string().uuid(),
    dateFrom: z.string().datetime(),
    dateTo: z.string().datetime(),
    isActive: z.boolean(),
    lockedAt: z.string().datetime(),
});

export const GetLockedPeriodsResponseSchema = z.object({
    lockedPeriods: z.array(LockedPeriodSchema),
});

export const CreateLockedPeriodSchema = z
    .object({
        dateFrom: z.string().min(1, 'Дата начала обязательна'),
        dateTo: z.string().min(1, 'Дата окончания обязательна'),
    })
    .refine(
        (data) => {
            if (!data.dateFrom || !data.dateTo) return true;
            return new Date(data.dateFrom) <= new Date(data.dateTo);
        },
        {
            message: 'Дата окончания должна быть не раньше даты начала',
            path: ['dateTo'],
        },
    );

export const CreateLockedPeriodResponseSchema = z.object({
    message: z.string(),
    lockedPeriod: LockedPeriodSchema,
});

export const OpenLockedPeriodResponseSchema = z.object({
    message: z.string(),
    lockedPeriod: LockedPeriodSchema,
});

export type LockedPeriod = z.infer<typeof LockedPeriodSchema>;
export type GetLockedPeriodsResponse = z.infer<typeof GetLockedPeriodsResponseSchema>;
export type CreateLockedPeriodRequest = z.infer<typeof CreateLockedPeriodSchema>;
export type CreateLockedPeriodResponse = z.infer<typeof CreateLockedPeriodResponseSchema>;
export type OpenLockedPeriodResponse = z.infer<typeof OpenLockedPeriodResponseSchema>;
