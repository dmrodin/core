import { z } from 'zod';

import { PaginationSchema } from './common-schemas';

const UserSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
});

export const NetworkSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid().optional(),
    updatedById: z.string().uuid().optional(),
    code: z.string(),
    name: z.string(),
    active: z.boolean().optional(),
    deleted: z.boolean().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    created_by: UserSchema.optional(),
    updated_by: UserSchema.optional(),
});

export const GetNetworksResponseSchema = z.object({
    networks: z.array(NetworkSchema),
    pagination: PaginationSchema,
});

export const NetworkTypeSummaryNetworkSchema = z.object({
    id: z.string().uuid(),
    code: z.string(),
    name: z.string(),
});

export const NetworkTypeSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid().optional(),
    updatedById: z.string().uuid().optional(),
    networkId: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    active: z.boolean().optional(),
    deleted: z.boolean().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    network: NetworkTypeSummaryNetworkSchema.optional(),
    created_by: UserSchema.optional(),
    updated_by: UserSchema.optional(),
});

export const GetNetworkTypesResponseSchema = z.object({
    networkTypes: z.array(NetworkTypeSchema),
    pagination: PaginationSchema,
});

export type Network = z.infer<typeof NetworkSchema>;
export type NetworksResponse = z.infer<typeof GetNetworksResponseSchema>;
export type NetworkType = z.infer<typeof NetworkTypeSchema>;
export type NetworkTypesResponse = z.infer<typeof GetNetworkTypesResponseSchema>;
