import {
    ApplicationResponseSchema,
    CreateApplicationRequest,
    CreateApplicationRequestSchema,
    GetApplicationByIdResponse,
    GetApplicationsFilters,
    GetApplicationsResponse,
    GetApplicationsResponseSchema,
    UpdateApplicationRequest,
    UpdateApplicationSchema,
    getApplicationsFiltersSchema,
} from '@/entities/application';
import { axiosInstance } from '@/shared';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class ApplicationService {
    /**
     * @param data
     */
    public static async create(data: CreateApplicationRequest): Promise<void> {
        const validatedData = CreateApplicationRequestSchema.parse(data);
        await axiosInstance.post(API_MAP.APPLICATIONS.APPLICATIONS, validatedData);
    }

    public static async getById(id: string): Promise<GetApplicationByIdResponse> {
        const { data } = await axiosInstance.get(API_MAP.APPLICATIONS.APPLICATION_BY_ID(id));
        return ApplicationResponseSchema.parse(data);
    }

    public static async update(id: string, data: UpdateApplicationRequest): Promise<void> {
        const validated = UpdateApplicationSchema.parse(data);
        await axiosInstance.put(API_MAP.APPLICATIONS.APPLICATION_BY_ID(id), validated);
    }

    public static async delete(id: number): Promise<void> {
        await axiosInstance.delete(API_MAP.APPLICATIONS.APPLICATION_BY_ID(id));
    }

    public static async getApplications(params?: GetApplicationsFilters): Promise<GetApplicationsResponse> {
        const response = await axiosInstance.get(API_MAP.APPLICATIONS.APPLICATIONS, {
            params: getApplicationsFiltersSchema.parse(params),
        });
        return GetApplicationsResponseSchema.parse(response.data);
    }
}
