import { axiosInstance } from '@/shared/api/axios-instance';

import {
    CreateNetworkRequest,
    CreateNetworkResponseSchema,
    DeleteNetworkResponseSchema,
    GetNetworkResponseSchema,
    GetNetworksResponseSchema,
    RestoreNetworkResponseSchema,
    UpdateNetworkRequest,
    UpdateNetworkResponseSchema,
} from '../model/network-schemas';
import {
    CreateNetworkTypeRequest,
    CreateNetworkTypeResponseSchema,
    DeleteNetworkTypeResponseSchema,
    GetNetworkTypeResponseSchema,
    GetNetworkTypesResponseSchema,
    RestoreNetworkTypeResponseSchema,
    UpdateNetworkTypeRequest,
    UpdateNetworkTypeResponseSchema,
} from '../model/network-type-schemas';

import type {
    CreateNetworkResponse,
    DeleteNetworkResponse,
    GetNetworkResponse,
    GetNetworksResponse,
    RestoreNetworkResponse,
    UpdateNetworkResponse,
} from '../model/network-schemas';
import type {
    CreateNetworkTypeResponse,
    DeleteNetworkTypeResponse,
    GetNetworkTypeResponse,
    GetNetworkTypesResponse,
    RestoreNetworkTypeResponse,
    UpdateNetworkTypeResponse,
} from '../model/network-type-schemas';

export const networkApi = {
    getNetworks: async (deleted?: boolean): Promise<GetNetworksResponse> => {
        const { data } = await axiosInstance.get('/networks', {
            params: deleted !== undefined ? { deleted } : {},
        });
        return GetNetworksResponseSchema.parse(data);
    },

    getNetwork: async (id: string): Promise<GetNetworkResponse> => {
        const { data } = await axiosInstance.get(`/networks/${id}`);
        return GetNetworkResponseSchema.parse(data);
    },

    createNetwork: async (dto: CreateNetworkRequest): Promise<CreateNetworkResponse> => {
        const { data } = await axiosInstance.post('/networks', dto);
        return CreateNetworkResponseSchema.parse(data);
    },

    updateNetwork: async (id: string, dto: UpdateNetworkRequest): Promise<UpdateNetworkResponse> => {
        const { data } = await axiosInstance.put(`/networks/${id}`, dto);
        return UpdateNetworkResponseSchema.parse(data);
    },

    deleteNetwork: async (id: string): Promise<DeleteNetworkResponse> => {
        const { data } = await axiosInstance.delete(`/networks/${id}`);
        return DeleteNetworkResponseSchema.parse(data);
    },

    restoreNetwork: async (id: string): Promise<RestoreNetworkResponse> => {
        const { data } = await axiosInstance.put(`/networks/${id}/restore`);
        return RestoreNetworkResponseSchema.parse(data);
    },

    getNetworkTypes: async (networkId?: string): Promise<GetNetworkTypesResponse> => {
        const { data } = await axiosInstance.get('/network-types', {
            params: networkId ? { networkId } : {},
        });
        return GetNetworkTypesResponseSchema.parse(data);
    },

    getNetworkType: async (id: string): Promise<GetNetworkTypeResponse> => {
        const { data } = await axiosInstance.get(`/network-types/${id}`);
        return GetNetworkTypeResponseSchema.parse(data);
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
