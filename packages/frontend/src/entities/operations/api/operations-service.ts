import { axiosInstance } from '@/shared';
import { API_MAP } from '@/shared/utils/constants/api-map';

import {
    CreateOperationBackendDto,
    CreateOperationBackendDtoSchema,
    GetOperationsParams,
    GetOperationsParamsSchema,
    GetOperationsResponseDto,
    GetOperationsResponseDtoSchema,
    OperationResponseDto,
    OperationResponseDtoSchema,
    UpdateOperationBackendDto,
    UpdateOperationBackendDtoSchema,
} from '../model/opeartions-schemas';

export class OperationsService {
    public static async create(data: CreateOperationBackendDto): Promise<void> {
        const validated = CreateOperationBackendDtoSchema.parse(data);
        await axiosInstance.post('/operations', validated);
    }
    public static async getOperations(params?: GetOperationsParams): Promise<GetOperationsResponseDto> {
        const validatedParams = params ? GetOperationsParamsSchema.parse(params) : undefined;
        const response = await axiosInstance.get(API_MAP.OPERATIONS.OPERATIONS, {
            params: validatedParams,
        });
        return GetOperationsResponseDtoSchema.parse(response.data);
    }

    public static async getById(id: string): Promise<OperationResponseDto> {
        const { data } = await axiosInstance.get(API_MAP.OPERATIONS.OPERATIONS_BY_ID(id));
        return OperationResponseDtoSchema.parse(data);
    }

    public static async update(id: string, data: UpdateOperationBackendDto): Promise<void> {
        const validated = UpdateOperationBackendDtoSchema.parse(data);
        await axiosInstance.put(API_MAP.OPERATIONS.OPERATIONS_BY_ID(id), validated);
    }

    public static async filter(filter: GetOperationsParams) {
        const validatedParams = GetOperationsParamsSchema.parse(filter);
        const { data } = await axiosInstance.get(API_MAP.OPERATIONS.OPERATIONS, {
            params: validatedParams,
        });
        return GetOperationsResponseDtoSchema.parse(data);
    }

    public static async delete(id: string): Promise<void> {
        await axiosInstance.delete(API_MAP.OPERATIONS.OPERATIONS_BY_ID(id));
    }
}
