import { z } from 'zod';

import { PaginationSchema } from '@/shared/utils/schemas/common-schemas';

export const CreateGuideSchema = z.object({
    fullName: z.string().min(1, 'Полное имя обязательно').max(200, 'Максимум 200 символов'),
    description: z.string().max(1000, 'Максимум 1000 символов').optional(),
    phone: z.string().max(20, 'Максимум 20 символов').optional(),
    cardNumber: z.string().max(50, 'Максимум 50 символов').optional(),
    birthDate: z.string().max(100, 'Максимум 100 символов').optional(),
    address: z.string().max(500, 'Максимум 500 символов').optional(),
});

export const GuideResponseSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    description: z.string().nullable(),
    phone: z.string().nullable(),
    cardNumber: z.string().nullable(),
    birthDate: z.string().nullable(),
    address: z.string().nullable(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const CreateGuideResponseSchema = z.object({
    message: z.string(),
    guide: GuideResponseSchema,
});

export const GetGuidesParamsSchema = z.object({
    search: z.string().optional(),
    userId: z.string().uuid().optional(),
    updatedById: z.string().uuid().optional(),
    sortField: z.enum(['createdAt', 'updatedAt', 'fullName', 'phone', 'address']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(100).default(10).optional(),
});

export const GetGuidesResponseSchema = z.object({
    guides: z.array(GuideResponseSchema),
    pagination: PaginationSchema,
});

export const GetGuideByIdSchema = z.object({
    id: z.string().uuid(),
});

export const UpdateGuideSchema = z.object({
    fullName: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    phone: z.string().max(20).optional(),
    cardNumber: z.string().max(50).optional(),
    birthDate: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
});

export const UpdateGuideResponseSchema = z.object({
    message: z.string(),
    guide: GuideResponseSchema,
});

export const DeleteGuideSchema = z.object({
    id: z.string().uuid(),
});

export const DeleteGuideResponseSchema = z.object({
    message: z.string(),
});

export type DeleteGuideResponse = z.infer<typeof DeleteGuideResponseSchema>;
export type DeleteGuideRequest = z.infer<typeof DeleteGuideSchema>;
export type UpdateGuideResponse = z.infer<typeof UpdateGuideResponseSchema>;
export type UpdateGuideRequest = z.infer<typeof UpdateGuideSchema>;
export type GetGuideByIdResponse = GuideResponse;
export type GetGuideByIdRequest = z.infer<typeof GetGuideByIdSchema>;
export type GetGuidesResponse = z.infer<typeof GetGuidesResponseSchema>;
export type GetGuidesParamsRequest = z.infer<typeof GetGuidesParamsSchema>;
export type CreateGuideResponse = z.infer<typeof CreateGuideResponseSchema>;
export type GuideResponse = z.infer<typeof GuideResponseSchema>;
export type CreateGuideRequest = z.infer<typeof CreateGuideSchema>;
