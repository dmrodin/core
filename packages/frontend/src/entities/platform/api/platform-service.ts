import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

import {
    CreatePlatformRequest,
    GetPlatformsResponse,
    GetPlatformsResponseSchema,
    Platform,
    PlatformSchema,
    UpdatePlatformRequest,
} from '../model/platform-schemas';

export class PlatformService {
    public static async getPlatforms(): Promise<GetPlatformsResponse> {
        const { data } = await axiosInstance.get(API_MAP.PLATFORMS.PLATFORMS);
        return GetPlatformsResponseSchema.parse(data);
    }

    public static async getPlatformById(id: string): Promise<Platform> {
        const { data } = await axiosInstance.get(API_MAP.PLATFORMS.PLATFORM_BY_ID(id));
        return PlatformSchema.parse(data);
    }

    public static async createPlatform(payload: CreatePlatformRequest): Promise<Platform> {
        const { data } = await axiosInstance.post(API_MAP.PLATFORMS.PLATFORMS, payload);
        return PlatformSchema.parse(data);
    }

    public static async updatePlatform(id: string, payload: UpdatePlatformRequest): Promise<Platform> {
        const { data } = await axiosInstance.put(API_MAP.PLATFORMS.PLATFORM_BY_ID(id), payload);
        return PlatformSchema.parse(data);
    }

    public static async deletePlatform(id: string): Promise<void> {
        await axiosInstance.delete(API_MAP.PLATFORMS.PLATFORM_BY_ID(id));
    }

    public static async restorePlatform(id: string): Promise<void> {
        await axiosInstance.patch(API_MAP.PLATFORMS.PLATFORM_BY_ID(id));
    }
}
