import axios from 'axios';

import {
    LoginRequest,
    LoginRequestSchema,
    LoginResponse,
    LoginResponseSchema,
    LogoutResponse,
    LogoutResponseSchema,
    RefreshTokensResponse,
    RefreshTokensResponseSchema,
    RegisterRequest,
    RegisterRequestSchema,
    RegisterResponse,
    RegisterResponseSchema,
} from '@/entities/auth/model/auth-schemas';
import { BASE_URL, axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class AuthService {
    public static async Login(data: LoginRequest): Promise<LoginResponse> {
        const validatedData = LoginRequestSchema.parse(data);
        const response = await axiosInstance.post(API_MAP.AUTH.LOGIN, validatedData);
        return LoginResponseSchema.parse(response.data);
    }

    public static async Register(data: RegisterRequest): Promise<RegisterResponse> {
        const validatedData = RegisterRequestSchema.parse(data);
        const response = await axiosInstance.post(API_MAP.AUTH.REGISTER, validatedData);
        return RegisterResponseSchema.parse(response.data);
    }

    public static async RefreshTokens(): Promise<RefreshTokensResponse> {
        const response = await axiosInstance.post(API_MAP.AUTH.REFRESH);
        return RefreshTokensResponseSchema.parse(response.data);
    }

    public static async Logout(): Promise<LogoutResponse> {
        const response = await axiosInstance.post(API_MAP.AUTH.LOGOUT);
        return LogoutResponseSchema.parse(response.data);
    }

    public static async refreshTokenRaw(token?: string): Promise<RefreshTokensResponse> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.post(
            `${BASE_URL}${API_MAP.AUTH.REFRESH}`,
            {},
            {
                headers,
                withCredentials: true,
            },
        );
        return RefreshTokensResponseSchema.parse(response.data);
    }
}
