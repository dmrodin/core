import {
    CreateGuideRequest,
    CreateGuideSchema,
    GetGuidesParamsRequest,
    GetGuidesParamsSchema,
    GetGuidesResponse,
    GetGuidesResponseSchema,
    GuideResponse,
    GuideResponseSchema,
    UpdateGuideRequest,
    UpdateGuideSchema,
} from '@/entities/guides/model/guide-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class GuideService {
    public static async create(data: CreateGuideRequest): Promise<void> {
        const validated = CreateGuideSchema.parse(data);
        await axiosInstance.post(API_MAP.GUIDES.GUIDES, validated);
    }

    public static async update(id: string, data: UpdateGuideRequest): Promise<void> {
        const validated = UpdateGuideSchema.parse(data);
        await axiosInstance.put(API_MAP.GUIDES.GUIDE_BY_ID(id), validated);
    }

    public static async getById(id: string): Promise<GuideResponse> {
        const { data } = await axiosInstance.get(API_MAP.GUIDES.GUIDE_BY_ID(id));
        return GuideResponseSchema.parse(data);
    }

    public static async getGuides(params?: GetGuidesParamsRequest): Promise<GetGuidesResponse> {
        const validatedParams = params ? GetGuidesParamsSchema.parse(params) : undefined;
        const response = await axiosInstance.get(API_MAP.GUIDES.GUIDES, {
            params: validatedParams,
        });
        return GetGuidesResponseSchema.parse(response.data);
    }

    public static async filter(filter: GetGuidesParamsRequest) {
        const validatedParams = GetGuidesParamsSchema.parse(filter);
        const { data } = await axiosInstance.get(API_MAP.GUIDES.GUIDES, {
            params: validatedParams,
        });
        return GetGuidesResponseSchema.parse(data);
    }

    public static async delete(id: string): Promise<void> {
        await axiosInstance.delete(API_MAP.GUIDES.GUIDE_BY_ID(id));
    }
}
