import { z } from 'zod';

export enum UserRole {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    USER = 'user',
}

export const UserRoleSchema = z.object({
    id: z.string(),
    code: z.enum([UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER]),
    name: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const UserAuthSchema = z.object({
    id: z.string(),
    telegramId: z.string().nullable(),
    username: z.string(),
    blocked: z.boolean(),
    deleted: z.boolean(),
    telegramNotifications: z.boolean(),
    isHolder: z.boolean().default(false),
    isCourier: z.boolean().default(false),
    lastLogin: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    roles: z.array(UserRoleSchema).default([]),
});

export const UserSchema = z.object({
    id: z.string().uuid(),
    username: z.string().min(1),
    roles: z.array(UserRoleSchema).default([]),
    blocked: z.boolean().default(false),
    telegramNotifications: z.boolean(),
    isHolder: z.boolean().default(false),
    isCourier: z.boolean().default(false),
    lastLogin: z.string().datetime().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const UsersResponseSchema = z.object({
    users: z.array(UserSchema),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    }),
});

export const GetUsersParamsSchema = z.object({
    search: z.string().optional(),
    roleCode: z.enum(['admin', 'moderator', 'user']).optional(),
    isHolder: z.boolean().optional(),
    isCourier: z.boolean().optional(),
    blocked: z.boolean().optional(),
    telegramNotifications: z.boolean().optional(),
    telegramId: z.string().optional(),
    deleted: z.boolean().optional(),
    sortField: z.enum(['username', 'createdAt', 'updatedAt', 'lastLogin']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(100),
});

export const CouriersSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    telegramId: z.string().nullable().optional(),
});

export const CouriersResponseSchema = z.object({
    items: z.array(CouriersSchema),
});

export const UserInfoSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
});

export type UserRoleType = z.infer<typeof UserRoleSchema>;
export type UserAuth = z.infer<typeof UserAuthSchema>;
export type UserType = z.infer<typeof UserSchema>;
export type UsersResponseType = z.infer<typeof UsersResponseSchema>;

export type Couriers = z.infer<typeof CouriersSchema>;
export type CouriersResponse = z.infer<typeof CouriersResponseSchema>;

export type GetUsersParams = z.infer<typeof GetUsersParamsSchema>;
