import { axiosInstance } from '@/shared/api/axios-instance';

import {
    CreateNetworkTypeRequest,
    CreateNetworkTypeResponseSchema,
    DeleteNetworkTypeResponseSchema,
    GetNetworkTypesResponseSchema,
    RestoreNetworkTypeResponseSchema,
    UpdateNetworkTypeRequest,
    UpdateNetworkTypeResponseSchema,
} from '../model/network-type-schemas';

import type {
    CreateNetworkTypeResponse,
    DeleteNetworkTypeResponse,
    GetNetworkTypesResponse,
    RestoreNetworkTypeResponse,
    UpdateNetworkTypeResponse,
} from '../model/network-type-schemas';

export const networkTypeApi = {
    getNetworkTypes: async (deleted?: boolean): Promise<GetNetworkTypesResponse> => {
        const { data } = await axiosInstance.get('/network-types', {
            params: deleted !== undefined ? { deleted } : {},
        });
        return GetNetworkTypesResponseSchema.parse(data);
    },

    createNetworkType: async (dto: CreateNetworkTypeRequest): Promise<CreateNetworkTypeResponse> => {
        const { data } = await axiosInstance.post('/network-types', dto);
        return CreateNetworkTypeResponseSchema.parse(data);
    },

    updateNetworkType: async (id: string, dto: UpdateNetworkTypeRequest): Promise<UpdateNetworkTypeResponse> => {
        const { data } = await axiosInstance.put(`/network-types/${id}`, dto);
        return UpdateNetworkTypeResponseSchema.parse(data);
    },

    deleteNetworkType: async (id: string): Promise<DeleteNetworkTypeResponse> => {
        const { data } = await axiosInstance.delete(`/network-types/${id}`);
        return DeleteNetworkTypeResponseSchema.parse(data);
    },

    restoreNetworkType: async (id: string): Promise<RestoreNetworkTypeResponse> => {
        const { data } = await axiosInstance.put(`/network-types/${id}/restore`);
        return RestoreNetworkTypeResponseSchema.parse(data);
    },
};
