import { z } from 'zod';

import { UserAuthSchema, UserRole } from '../../../entities/users/model/user-schemas';

export const LoginRequestSchema = z.object({
    username: z
        .string()
        .min(3, 'Имя пользователя должно содержать минимум 3 символа')
        .max(50, 'Имя пользователя не должно превышать 50 символов'),
    password: z.string().min(1, 'Пароль не может быть пустым'),
});

export const RegisterRequestSchema = z.object({
    username: z
        .string()
        .min(3, 'Имя пользователя должно содержать минимум 3 символа')
        .max(50, 'Имя пользователя не должно превышать 50 символов'),
    password: z
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .max(100, 'Пароль не должен превышать 100 символов')
        .regex(/[A-Za-z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    roles: z.array(z.nativeEnum(UserRole)).min(1, 'Должна быть выбрана хотя бы одна роль'),
});

export const RegisterResponseSchema = z.object({
    message: z.string(),
    user: UserAuthSchema,
});

export const LoginResponseSchema = z.object({
    accessToken: z.string(),
    user: UserAuthSchema,
    message: z.string(),
});

export const RefreshTokensResponseSchema = z.object({
    accessToken: z.string(),
    message: z.string(),
});

export const LogoutResponseSchema = z.object({
    message: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RefreshTokensResponse = z.infer<typeof RefreshTokensResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
