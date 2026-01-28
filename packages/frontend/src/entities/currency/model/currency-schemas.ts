import { z } from 'zod';

export const CurrencySchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    active: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const CreateCurrencySchema = z.object({
    code: z.string().min(1, 'Код валюты обязателен'),
    name: z.string().min(1, 'Название валюты обязательно'),
    active: z.boolean().default(true),
});

export const UpdateCurrencySchema = z.object({
    code: z.string().min(1, 'Код валюты обязателен').optional(),
    name: z.string().min(1, 'Название валюты обязательно').optional(),
    active: z.boolean().optional(),
});

export const GetCurrenciesParamsSchema = z.object({
    search: z.string().optional(),
    code: z.string().optional(),
    sortField: z.enum(['code', 'name', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
});

export const GetCurrenciesResponseSchema = z.object({
    currencies: z.array(CurrencySchema),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    }),
});

export const CurrencyInfoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
});

export const CreateCurrencyResponseSchema = z.object({
    message: z.string(),
    currency: CurrencySchema,
});

export const UpdateCurrencyResponseSchema = z.object({
    message: z.string(),
    currency: CurrencySchema,
});

export const DeleteCurrencyResponseSchema = z.object({
    message: z.string(),
});

export const RestoreCurrencyResponseSchema = z.object({
    message: z.string(),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type CreateCurrencyRequest = z.infer<typeof CreateCurrencySchema>;
export type UpdateCurrencyRequest = z.infer<typeof UpdateCurrencySchema>;
export type GetCurrenciesResponse = z.infer<typeof GetCurrenciesResponseSchema>;
export type CreateCurrencyResponse = z.infer<typeof CreateCurrencyResponseSchema>;
export type UpdateCurrencyResponse = z.infer<typeof UpdateCurrencyResponseSchema>;
export type DeleteCurrencyResponse = z.infer<typeof DeleteCurrencyResponseSchema>;
export type RestoreCurrencyResponse = z.infer<typeof RestoreCurrencyResponseSchema>;
export type GetCurrenciesParams = z.infer<typeof GetCurrenciesParamsSchema>;
export type CurrenciesResponse = z.infer<typeof GetCurrenciesResponseSchema>;
