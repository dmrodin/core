import type { z } from 'zod';

import { RegisterRequest, RegisterRequestSchema } from '@/entities/auth/model/auth-schemas';
import {
    Couriers,
    GetUsersParams,
    GetUsersParamsSchema,
    UserSchema,
    UserType,
    UsersResponseSchema,
    UsersResponseType,
} from '@/entities/users/model/user-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class UserService {
    public static async getUsers(params?: Partial<GetUsersParams>): Promise<UsersResponseType> {
        const queryParams = Object.fromEntries(
            Object.entries(GetUsersParamsSchema.parse(params || {})).filter(([, value]) => value !== undefined),
        );

        const response = await axiosInstance.get(API_MAP.USERS.USERS, {
            params: queryParams,
        });
        return UsersResponseSchema.parse(response.data);
    }

    public static async createUser(payload: RegisterRequest): Promise<UserType> {
        const parsedPayload = RegisterRequestSchema.parse(payload);
        const response = await axiosInstance.post(API_MAP.AUTH.REGISTER, parsedPayload);
        return UserSchema.parse(response.data.user);
    }

    public static async getCouriers(params?: Partial<GetUsersParams>): Promise<Couriers[]> {
        const response = await axiosInstance.get(API_MAP.USERS.USERS, {
            params: {
                isCourier: true,
                ...params,
            },
        });
        return UsersResponseSchema.parse(response.data).users;
    }

    public static async blockUser(userId: string, blocked: boolean): Promise<UserType> {
        const response = await axiosInstance.put(API_MAP.USERS.BLOCK_USER(userId), {
            blocked,
        });
        return UserSchema.parse(response.data.user ?? response.data);
    }

    public static async updateUserRole(userId: string, roleCodes: string[]): Promise<UserType> {
        const response = await axiosInstance.put(API_MAP.USERS.USER_ROLES(userId), {
            roleCodes,
        });
        return UserSchema.parse(response.data.user ?? response.data);
    }

    public static async deleteUser(userId: string): Promise<void> {
        await axiosInstance.delete(API_MAP.USERS.USER_BY_ID(userId));
    }
}

export type GetUsersResponse = z.infer<typeof UsersResponseSchema>;
