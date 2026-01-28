import { z } from 'zod';

import { PaginationSchema } from '@/shared/utils/schemas/common-schemas';

export const OperationTypeSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    isSeparateTab: z.boolean(),
    active: z.boolean(),
    isSystem: z.boolean(),
    isCorrection: z.boolean(),
    isConversion: z.boolean(),
    isAvans: z.boolean(),
    isDebit: z.boolean().optional(),
    isCredit: z.boolean().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    created_by: z
        .object({
            id: z.string().uuid(),
            username: z.string(),
        })
        .optional(),
    updated_by: z
        .object({
            id: z.string().uuid(),
            username: z.string(),
        })
        .optional(),
});

export const GetOperationTypesParamsSchema = z.object({
    search: z.string().optional(),
    sortField: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
});

export const CreateOperationTypeSchema = z.object({
    code: z.string().min(2, 'Код должен содержать минимум 2 символа').max(50, 'Код не должен превышать 50 символов'),
    name: z
        .string()
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(100, 'Название не должно превышать 100 символов'),
    description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional().nullable(),
    isSeparateTab: z.boolean(),
    active: z.boolean().default(true),
});

export const UpdateOperationTypeSchema = z.object({
    code: z
        .string()
        .min(2, 'Код должен содержать минимум 2 символа')
        .max(50, 'Код не должен превышать 50 символов')
        .optional(),
    name: z
        .string()
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(100, 'Название не должно превышать 100 символов')
        .optional(),
    description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional().nullable(),
    isSeparateTab: z.boolean().optional(),
    active: z.boolean().optional(),
});

export const OperationTypesResponseSchema = z.object({
    operationTypes: z.array(OperationTypeSchema),
    pagination: PaginationSchema,
});

export const OperationTypeInfoSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
    isCorrection: z.boolean(),
    isConversion: z.boolean(),
    isAvans: z.boolean(),
});

export const OperationInfoSchema = z.object({
    id: z.string().uuid(),
    description: z.string().nullable(),
});

export const CreateOperationTypeResponseSchema = z.object({
    message: z.string(),
    operationType: OperationTypeSchema,
});

export const UpdateOperationTypeResponseSchema = z.object({
    message: z.string(),
    operationType: OperationTypeSchema,
});

export const DeleteOperationTypeResponseSchema = z.object({
    message: z.string(),
});

export type OperationType = z.infer<typeof OperationTypeSchema>;
export type GetOperationTypesParams = z.infer<typeof GetOperationTypesParamsSchema>;
export type CreateOperationTypeRequest = z.infer<typeof CreateOperationTypeSchema>;
export type UpdateOperationTypeRequest = z.infer<typeof UpdateOperationTypeSchema>;
export type OperationTypesResponse = z.infer<typeof OperationTypesResponseSchema>;
export type CreateOperationTypeResponse = z.infer<typeof CreateOperationTypeResponseSchema>;
export type UpdateOperationTypeResponse = z.infer<typeof UpdateOperationTypeResponseSchema>;
export type DeleteOperationTypeResponse = z.infer<typeof DeleteOperationTypeResponseSchema>;
