import { z } from 'zod';

import { CurrencyInfoSchema } from '../../currency/model/currency-schemas';
import { OperationInfoSchema, OperationTypeInfoSchema } from '../../operations/model/operation-type-schemas';
import { UserInfoSchema } from '../../users/model/user-schemas';

const AdvanceEntrySchema = z.object({
    walletId: z.string().uuid('Выберите кошелек'),
    direction: z.enum(['credit', 'debit']),
    amount: z.number().int().positive('Сумма должна быть больше 0'),
});

export const CreateApplicationRequestSchema = z
    .object({
        currencyId: z.string().uuid('ID валюты должен быть валидным UUID'),
        operationTypeId: z.string().uuid('ID типа операции должен быть валидным UUID'),
        assigneeUserId: z.string().uuid('ID исполнителя должен быть валидным UUID'),
        description: z.string().max(2000, 'Описание не должно превышать 2000 символов').optional(),
        amount: z.number().int().min(0, 'Сумма не может быть отрицательной'),
        telegramUsername: z
            .string()
            .max(100, 'Telegram username не должен превышать 100 символов')
            .regex(/^@?[a-zA-Z0-9_]*$/, 'Можно использовать только буквы, цифры и подчеркивания')
            .transform((val) => val.replace(/^@/, ''))
            .optional()
            .or(z.literal('')),
        phone: z.string().max(20, 'Телефон не должен превышать 20 символов').optional(),
        meetingDate: z.string().datetime('Неверный формат даты'),
        advance: z
            .object({
                // Legacy формат для обратной совместимости.
                amount: z.number().int().min(0, 'Аванс не может быть отрицательным').optional(),
                currencyId: z.string().uuid('ID валюты аванса должен быть валидным UUID').optional(),
                entries: z.array(AdvanceEntrySchema).optional(),
            })
            .nullable()
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.advance?.entries?.length) {
            return;
        }

        const hasDebit = data.advance.entries.some((entry) => entry.direction === 'debit');
        const hasCredit = data.advance.entries.some((entry) => entry.direction === 'credit');

        if (!hasDebit || !hasCredit) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['advance', 'entries'],
                message: 'Для аванса заполните обе стороны: "Вычесть из..." и "Прибавить к...".',
            });
        }
    });

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;

const ApplicationStatus = z.enum(['all', 'open', 'done']);
const ApplicationSortField = z.enum(['status', 'amount', 'meetingDate', 'createdAt', 'updatedAt']);
const SortOrder = z.enum(['asc', 'desc']);

export const getApplicationsFiltersSchema = z.object({
    search: z.string().optional(),
    status: ApplicationStatus.optional(),

    minAmount: z.coerce.number().int().min(0).optional(),
    maxAmount: z.coerce.number().int().min(0).optional(),

    currencyId: z.string().uuid().optional(),
    operationTypeId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    assigneeUserId: z.string().uuid().optional(),
    updatedById: z.string().uuid().optional(),

    createdFrom: z.string().datetime().optional(),
    createdTo: z.string().datetime().optional(),
    meetingDateFrom: z.string().datetime().optional(),
    meetingDateTo: z.string().datetime().optional(),

    sortField: ApplicationSortField.optional(),
    sortOrder: SortOrder.optional(),

    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type GetApplicationsFilters = z.infer<typeof getApplicationsFiltersSchema>;

export const ApplicationResponseSchema = z.object({
    id: z.number().int(),
    description: z.string().nullable(),
    status: ApplicationStatus,
    amount: z.number().int(),
    currencyId: z.string().uuid(),
    operationTypeId: z.string().uuid(),
    operationId: z.string().uuid().nullable(),
    userId: z.string().uuid(),
    assigneeUserId: z.string().uuid(),
    updatedById: z.string().uuid().nullable(),
    created_by: UserInfoSchema,
    updated_by: UserInfoSchema.nullable(),
    assignee_user: UserInfoSchema,
    currency: CurrencyInfoSchema,
    operation_type: OperationTypeInfoSchema,
    operation: OperationInfoSchema.nullable(),
    telegramUsername: z.string().nullable(),
    phone: z.string().nullable(),
    meetingDate: z.string().datetime(),
    hasAdvance: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    advance: z
        .object({
            amount: z.number().int(),
            currency: z.string(),
        })
        .nullable()
        .optional(),
});

export const CreateApplicationResponseSchema = z.object({
    message: z.string(),
    application: ApplicationResponseSchema,
});

export type CreateApplicationResponse = z.infer<typeof CreateApplicationResponseSchema>;

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const GetApplicationsResponseSchema = z.object({
    applications: z.array(ApplicationResponseSchema),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    }),
});

export type GetApplicationsResponse = z.infer<typeof GetApplicationsResponseSchema>;

export const GetApplicationByIdSchema = z.object({
    id: z.number().int().positive(),
});

export type GetApplicationByIdRequest = z.infer<typeof GetApplicationByIdSchema>;
export type GetApplicationByIdResponse = ApplicationResponse;

export const UpdateApplicationSchema = z.object({
    description: z.string().max(2000).optional(),
    status: ApplicationStatus.optional(),
    amount: z.number().int().min(0).optional(),
    currencyId: z.string().uuid().optional(),
    operationTypeId: z.string().uuid().optional(),
    assigneeUserId: z.string().uuid().optional(),
    operationId: z.string().uuid().optional(),
    telegramUsername: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    meetingDate: z.string().datetime().optional(),
    advance: z
        .object({
            amount: z.number().min(0).optional(),
            currencyId: z.string().uuid().optional(),
            entries: z.array(AdvanceEntrySchema).optional(),
        })
        .optional()
        .nullable(),
});

export type UpdateApplicationRequest = z.infer<typeof UpdateApplicationSchema>;

export const UpdateApplicationResponseSchema = z.object({
    message: z.string(),
    application: ApplicationResponseSchema,
});

export type UpdateApplicationResponse = z.infer<typeof UpdateApplicationResponseSchema>;

export const DeleteApplicationSchema = z.object({
    id: z.number().int().positive(),
});

export type DeleteApplicationRequest = z.infer<typeof DeleteApplicationSchema>;

export const DeleteApplicationResponseSchema = z.object({
    message: z.string(),
});

export type DeleteApplicationResponse = z.infer<typeof DeleteApplicationResponseSchema>;
