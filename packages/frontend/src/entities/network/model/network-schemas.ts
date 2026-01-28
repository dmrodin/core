import { z } from 'zod';

const UserSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
});

export const NetworkSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    updatedById: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    active: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    created_by: UserSchema,
    updated_by: UserSchema,
});

export const CreateNetworkSchema = z.object({
    code: z.string().min(1, 'Код сети обязателен'),
    name: z.string().min(1, 'Название сети обязательно'),
    active: z.boolean().default(true),
});

export const UpdateNetworkSchema = z.object({
    code: z.string().min(1, 'Код сети обязателен').optional(),
    name: z.string().min(1, 'Название сети обязательно').optional(),
    active: z.boolean().optional(),
});

export const GetNetworksResponseSchema = z.object({
    networks: z.array(NetworkSchema),
});

// Backend возвращает прямой объект сети, а не обёрнутый
export const GetNetworkResponseSchema = NetworkSchema;

export const CreateNetworkResponseSchema = z.object({
    message: z.string(),
    network: NetworkSchema,
});

export const UpdateNetworkResponseSchema = z.object({
    message: z.string(),
    network: NetworkSchema,
});

export const DeleteNetworkResponseSchema = z.object({
    message: z.string(),
});

export const RestoreNetworkResponseSchema = z.object({
    message: z.string(),
});

export type Network = z.infer<typeof NetworkSchema>;
export type CreateNetworkRequest = z.infer<typeof CreateNetworkSchema>;
export type UpdateNetworkRequest = z.infer<typeof UpdateNetworkSchema>;
export type GetNetworksResponse = z.infer<typeof GetNetworksResponseSchema>;
export type GetNetworkResponse = z.infer<typeof GetNetworkResponseSchema>;
export type CreateNetworkResponse = z.infer<typeof CreateNetworkResponseSchema>;
export type UpdateNetworkResponse = z.infer<typeof UpdateNetworkResponseSchema>;
export type DeleteNetworkResponse = z.infer<typeof DeleteNetworkResponseSchema>;
export type RestoreNetworkResponse = z.infer<typeof RestoreNetworkResponseSchema>;
