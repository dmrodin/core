import { z } from 'zod';

const UserSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
});

const NetworkSchema = z.object({
    id: z.string().uuid(),
    code: z.string(),
    name: z.string(),
});

export const NetworkTypeSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    networkId: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    active: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    network: NetworkSchema,
    created_by: UserSchema,
    updated_by: UserSchema,
});

export const CreateNetworkTypeSchema = z.object({
    networkId: z.string().uuid({ message: 'Выберите сеть' }),
    code: z.string().min(1, 'Код типа сети обязателен'),
    name: z.string().min(1, 'Название типа сети обязательно'),
    active: z.boolean().default(true),
});

export const UpdateNetworkTypeSchema = z.object({
    networkId: z.string().uuid().optional(),
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    active: z.boolean().optional(),
});

export const GetNetworkTypesResponseSchema = z.object({
    networkTypes: z.array(NetworkTypeSchema),
});

// Backend возвращает прямой объект типа сети, а не обёрнутый
export const GetNetworkTypeResponseSchema = NetworkTypeSchema;

export const CreateNetworkTypeResponseSchema = z.object({
    message: z.string(),
    networkType: NetworkTypeSchema,
});

export const UpdateNetworkTypeResponseSchema = z.object({
    message: z.string(),
    networkType: NetworkTypeSchema,
});

export const DeleteNetworkTypeResponseSchema = z.object({
    message: z.string(),
});

export const RestoreNetworkTypeResponseSchema = z.object({
    message: z.string(),
});

export type NetworkType = z.infer<typeof NetworkTypeSchema>;
export type CreateNetworkTypeRequest = z.infer<typeof CreateNetworkTypeSchema>;
export type UpdateNetworkTypeRequest = z.infer<typeof UpdateNetworkTypeSchema>;
export type GetNetworkTypesResponse = z.infer<typeof GetNetworkTypesResponseSchema>;
export type GetNetworkTypeResponse = z.infer<typeof GetNetworkTypeResponseSchema>;
export type CreateNetworkTypeResponse = z.infer<typeof CreateNetworkTypeResponseSchema>;
export type UpdateNetworkTypeResponse = z.infer<typeof UpdateNetworkTypeResponseSchema>;
export type DeleteNetworkTypeResponse = z.infer<typeof DeleteNetworkTypeResponseSchema>;
export type RestoreNetworkTypeResponse = z.infer<typeof RestoreNetworkTypeResponseSchema>;
