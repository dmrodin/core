import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';
import {
    GetNetworkTypesResponseSchema,
    GetNetworksResponseSchema,
    NetworkTypesResponse,
    NetworksResponse,
} from '@/shared/utils/schemas/network-schemas';

export class NetworkService {
    public static async getNetworks(): Promise<NetworksResponse> {
        const { data } = await axiosInstance.get(API_MAP.NETWORKS.NETWORKS, {
            params: { limit: 100 },
        });

        return GetNetworksResponseSchema.parse(data);
    }

    public static async getNetworkTypes(networkId?: string): Promise<NetworkTypesResponse> {
        const params: Record<string, unknown> = { limit: 100 };

        if (networkId) {
            params.networkId = networkId;
        }

        const { data } = await axiosInstance.get(API_MAP.NETWORK_TYPES.NETWORK_TYPES, { params });

        return GetNetworkTypesResponseSchema.parse(data);
    }
}
