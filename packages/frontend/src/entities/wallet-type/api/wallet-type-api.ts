import { axiosInstance } from '@/shared/api/axios-instance';

import {
    CreateWalletTypeRequest,
    CreateWalletTypeResponse,
    CreateWalletTypeResponseSchema,
    DeleteWalletTypeResponse,
    DeleteWalletTypeResponseSchema,
    GetWalletTypesResponse,
    GetWalletTypesResponseSchema,
    UpdateWalletTypeRequest,
    UpdateWalletTypeResponse,
    UpdateWalletTypeResponseSchema,
} from '../model/wallet-type-schemas';

export const walletTypeApi = {
    getWalletTypes: async (deleted?: boolean): Promise<GetWalletTypesResponse> => {
        const { data } = await axiosInstance.get('/wallet-types', {
            params: { deleted },
        });
        return GetWalletTypesResponseSchema.parse(data);
    },

    createWalletType: async (dto: CreateWalletTypeRequest): Promise<CreateWalletTypeResponse> => {
        const { data } = await axiosInstance.post('/wallet-types', dto);
        return CreateWalletTypeResponseSchema.parse(data);
    },

    updateWalletType: async (id: string, dto: UpdateWalletTypeRequest): Promise<UpdateWalletTypeResponse> => {
        const { data } = await axiosInstance.put(`/wallet-types/${id}`, dto);
        return UpdateWalletTypeResponseSchema.parse(data);
    },

    deleteWalletType: async (id: string): Promise<DeleteWalletTypeResponse> => {
        const { data } = await axiosInstance.delete(`/wallet-types/${id}`);
        return DeleteWalletTypeResponseSchema.parse(data);
    },
};
