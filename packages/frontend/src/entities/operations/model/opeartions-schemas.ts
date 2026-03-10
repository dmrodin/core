import z from 'zod';

import { ReportsConversionSchema, ReportsGeneralSchema, ReportsPeriodSchema } from '@/entities/reports';
import { PaginationSchema } from '@/shared/utils/schemas/common-schemas';

import { OperationTypeInfoSchema } from './operation-type-schemas';

export const ExpenseCategorySchema = z.enum(['salary', 'other']);

const isDateNotInFuture = (value?: string) => {
    if (!value) return true;
    let parsed: Date | null = null;
    if (value.includes('T')) {
        const date = new Date(value);
        parsed = Number.isNaN(date.getTime()) ? null : date;
    } else if (value.includes('.')) {
        const parts = value.split('.');
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts.map(Number);
            const date = new Date(yyyy, mm - 1, dd);
            parsed = Number.isNaN(date.getTime()) ? null : date;
        }
    } else {
        const date = new Date(value);
        parsed = Number.isNaN(date.getTime()) ? null : date;
    }

    if (!parsed) return true;

    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const parsedLocal = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

    return parsedLocal <= todayLocal;
};

export const OperationSchema = z.object({
    id: z.string().uuid(),
    description: z.string().nullable(),
});

// Схема для получения entries от API (с walletId и wallet объектом)
export const OperationEntryApiSchema = z.object({
    id: z.string().uuid(),
    walletId: z.string().uuid(),
    wallet: z.object({
        id: z.string().uuid(),
        name: z.string(),
        walletTypeId: z.string().uuid().optional().nullable(),
    }),
    direction: z.enum(['credit', 'debit']),
    amount: z.number(),
    before: z.number().nullable(),
    after: z.number().nullable(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// Схема для работы в UI (с wallet объектом)
export const OperationEntryDtoSchema = z.object({
    id: z.string().uuid().optional(),
    wallet: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }),
    direction: z.enum(['credit', 'debit']),
    before: z.number().nullable().optional(),
    amount: z.number().min(1),
    after: z.number().nullable().optional(),
    userId: z.string().uuid().optional(),
    updatedById: z.string().uuid().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export const OperationEntryCreateDtoSchema = z.object({
    id: z.string().uuid().optional(),
    wallet: z.object({
        id: z.string().uuid('Выберите кошелек'),
        name: z.string(),
    }),
    direction: z.enum(['credit', 'debit']),
    amount: z.number().positive('Сумма должна быть больше 0'),
});

export const CreateOperationDtoSchema = z.object({
    typeId: z.string().uuid('Выберите тип операции'),
    applicationId: z.number().optional(),
    expenseCategory: ExpenseCategorySchema.optional().nullable(),
    description: z.string().max(2000, 'Максимум 2000 символов').optional().nullable(),
    conversionGroupId: z.number().int().positive().optional().nullable(),
    banksGroupId: z.string().optional().nullable(),
    entries: z.array(OperationEntryCreateDtoSchema).min(1, 'Добавьте хотя бы одну запись операции'),
    creatureDate: z.string().optional().refine(isDateNotInFuture, {
        message: 'Дата операции не может быть в будущем',
    }),
});

export const CreateOperationBackendDtoSchema = z.object({
    typeId: z.string().uuid(),
    applicationId: z.number().optional(),
    expenseCategory: ExpenseCategorySchema.optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    conversionGroupId: z.number().int().positive().optional().nullable(),
    entries: z
        .array(
            z.object({
                walletId: z.string().uuid(),
                direction: z.enum(['credit', 'debit']),
                amount: z.number().positive(),
            }),
        )
        .min(1),
    creatureDate: z.string().optional(),
    banksGroupId: z.string().optional().nullable(),
});

export const OperationEntryUpdateDtoSchema = z.object({
    id: z.string().uuid(),
    wallet: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }),
    direction: z.enum(['credit', 'debit']),
    before: z.number().nullable(),
    amount: z.number(),
    after: z.number().nullable(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Схема для отправки на бэкенд (с walletId)
export const UpdateOperationEntryBackendSchema = z.object({
    id: z.string().uuid().optional(),
    walletId: z.string().uuid(),
    direction: z.enum(['credit', 'debit']),
    amount: z.number().positive('Сумма должна быть больше 0'),
});

export const UpdateOperationDtoSchema = z.object({
    typeId: z.string().uuid().optional(),
    applicationId: z.number().optional(),
    expenseCategory: ExpenseCategorySchema.optional().nullable(),
    description: z.string().max(2000, 'Максимум 2000 символов').optional().nullable(),
    conversionGroupId: z.number().int().positive().optional().nullable(),
    entries: z.array(OperationEntryDtoSchema).optional(),
    creatureDate: z.string().optional(),
});

export const UpdateOperationBackendDtoSchema = z.object({
    typeId: z.string().uuid().optional(),
    applicationId: z.number().optional(),
    expenseCategory: ExpenseCategorySchema.optional().nullable(),
    description: z.string().max(2000, 'Максимум 2000 символов').optional().nullable(),
    conversionGroupId: z.number().int().positive().optional().nullable(),
    entries: z.array(UpdateOperationEntryBackendSchema).optional(),
    creatureDate: z.string().optional(),
    banksGroupId: z.string().optional().nullable(),
});

export const OperationResponseDtoSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    typeId: z.string().uuid(),
    applicationId: z.number().optional().nullable(),
    expenseCategory: ExpenseCategorySchema.optional().nullable(),
    description: z.string().max(2000, 'Максиммум 2000 символов').optional().nullable(),
    conversionGroupId: z.number().int().positive().nullable(),
    banksGroupId: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    entries: z.array(OperationEntryApiSchema),
    type: OperationTypeInfoSchema,
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

export const GetOperationsResponseDtoSchema = z.object({
    operations: z.array(OperationResponseDtoSchema),
    pagination: PaginationSchema,
});

export const GetOperationsParamsSchema = z.object({
    search: z.string().optional(),
    typeId: z.string().uuid().nullable().optional(),
    userId: z.string().uuid().nullable().optional(),
    walletId: z.string().uuid().nullable().optional(),
    applicationId: z.string().nullable().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(100).default(10).optional(),
});

export type OperationResponseDto = z.infer<typeof OperationResponseDtoSchema>;
export type UpdateOperationDto = z.infer<typeof UpdateOperationDtoSchema>;
export type UpdateOperationBackendDto = z.infer<typeof UpdateOperationBackendDtoSchema>;
export type GetOperationsResponseDto = z.infer<typeof GetOperationsResponseDtoSchema>;
export type GetOperationsParams = z.infer<typeof GetOperationsParamsSchema>;
export type ReportsGeneral = z.infer<typeof ReportsGeneralSchema>;
export type ReportsConversion = z.infer<typeof ReportsConversionSchema>;
export type ReportsPeriod = z.infer<typeof ReportsPeriodSchema>;
export type OperationEntryDto = z.infer<typeof OperationEntryDtoSchema>;
export type CreateOperationDto = z.infer<typeof CreateOperationDtoSchema>;
export type CreateOperationBackendDto = z.infer<typeof CreateOperationBackendDtoSchema>;
export type OperationEntryCreateDto = z.infer<typeof OperationEntryCreateDtoSchema>;
