import { z } from 'zod';

export interface WalletType {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    showInTabs: boolean;
    tabOrder: number;
    color?: string | null;
    icon?: string | null;
    active: boolean;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const WalletTypeSchema = z.object({
    id: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    showInTabs: z.boolean(),
    tabOrder: z.number(),
    color: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    active: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const CreateWalletTypeSchema = z.object({
    code: z
        .string({ message: 'Код обязателен' })
        .min(2, 'Код должен содержать минимум 2 символа')
        .max(50, 'Код не должен превышать 50 символов'),
    name: z
        .string({ message: 'Название обязательно' })
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(100, 'Название не должно превышать 100 символов'),
    description: z
        .string()
        .max(500, 'Описание не должно превышать 500 символов')
        .transform((v) => {
            if (!v) return undefined;
            const t = v.trim();
            return t.length ? t : undefined;
        })
        .optional(),
    showInTabs: z.boolean().default(false).optional(),
    tabOrder: z
        .number({ message: 'Порядок должен быть числом' })
        .refine(Number.isInteger, 'Порядок должен быть целым числом')
        .min(0, 'Порядок не может быть отрицательным')
        .optional(),
    active: z.boolean().default(true),
});

export const UpdateWalletTypeSchema = z.object({
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
    description: z
        .string()
        .max(500, 'Описание не должно превышать 500 символов')
        .transform((v) => {
            if (v === undefined) return undefined;
            const t = v.trim();
            return t.length ? t : undefined;
        })
        .optional(),
    showInTabs: z.boolean().optional(),
    tabOrder: z
        .number({ message: 'Порядок должен быть числом' })
        .int('Порядок должен быть целым числом')
        .min(0, 'Порядок не может быть отрицательным')
        .optional(),
    active: z.boolean().optional(),
});

export const GetWalletTypesResponseSchema = z.object({
    walletTypes: z.array(WalletTypeSchema),
});

export const CreateWalletTypeResponseSchema = z.object({
    message: z.string(),
    walletType: WalletTypeSchema,
});

export const UpdateWalletTypeResponseSchema = z.object({
    message: z.string(),
    walletType: WalletTypeSchema,
});

export const DeleteWalletTypeResponseSchema = z.object({
    message: z.string(),
});

export type CreateWalletTypeRequest = z.infer<typeof CreateWalletTypeSchema>;
export type UpdateWalletTypeRequest = z.infer<typeof UpdateWalletTypeSchema>;
export type GetWalletTypesResponse = z.infer<typeof GetWalletTypesResponseSchema>;
export type CreateWalletTypeResponse = z.infer<typeof CreateWalletTypeResponseSchema>;
export type UpdateWalletTypeResponse = z.infer<typeof UpdateWalletTypeResponseSchema>;
export type DeleteWalletTypeResponse = z.infer<typeof DeleteWalletTypeResponseSchema>;
