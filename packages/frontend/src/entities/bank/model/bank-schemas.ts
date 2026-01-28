import { z } from 'zod';

export const BankSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
    active: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const GetBanksResponseSchema = z.object({
    banks: z.array(BankSchema),
});

export const CreateBankSchema = z.object({
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

export const UpdateBankSchema = CreateBankSchema.partial();

export type Bank = z.infer<typeof BankSchema>;
export type GetBanksResponse = z.infer<typeof GetBanksResponseSchema>;
export type CreateBankRequest = z.infer<typeof CreateBankSchema>;
export type UpdateBankRequest = z.infer<typeof UpdateBankSchema>;
