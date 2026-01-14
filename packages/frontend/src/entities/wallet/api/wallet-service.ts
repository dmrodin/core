import {
  CreateWalletRequest,
  CreateWalletSchema,
  GetPinnedWalletsResponse,
  GetPinnedWalletsResponseSchema,
  GetWalletsFilter,
  GetWalletsFilterSchema,
  GetWalletsResponse,
  GetWalletsResponseSchema,
  Wallet,
  WalletSchema,
} from '@/entities/wallet/model/wallet-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class WalletService {
  public static async getPinnedWallets(): Promise<GetPinnedWalletsResponse> {
    const { data } = await axiosInstance.get(API_MAP.WALLETS.PINNED);
    return GetPinnedWalletsResponseSchema.parse(data);
  }

  public static async getWallets(
    filters?: Partial<GetWalletsFilter>,
  ): Promise<GetWalletsResponse> {
    const validated = GetWalletsFilterSchema.parse(filters ?? {});
    const params = Object.fromEntries(
      Object.entries(validated).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );

    const { data } = await axiosInstance.get(API_MAP.WALLETS.WALLETS, {
      params,
    });

    return GetWalletsResponseSchema.parse(data);
  }

  public static async getWalletsAggregation(params: GetWalletsFilter): Promise<{
    currencyGroups: {
      currency: {
        id: string;
        code: string;
        name: string;
      };
      totalAmount: number;
      walletsCount: number;
    }[];
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await axiosInstance.get(
      `${API_MAP.WALLETS.WALLETS}/aggregation?${queryParams.toString()}`,
    );

    return response.data;
  }

  public static async createWallet(
    payload: CreateWalletRequest,
  ): Promise<Wallet> {
    const validated = CreateWalletSchema.parse(payload);
    const { data } = await axiosInstance.post(
      API_MAP.WALLETS.WALLETS,
      validated,
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async changeWalletOwner(
    walletId: string,
    newOwnerId: string,
  ): Promise<Wallet> {
    const { data } = await axiosInstance.put(
      `${API_MAP.WALLETS.WALLETS}/${walletId}/owner`,
      { newOwnerId },
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async updateSecondOwner(
    walletId: string,
    secondUserId: string | undefined,
  ): Promise<Wallet> {
    const { data } = await axiosInstance.patch(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
      { secondUserId },
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async toggleWalletPin(
    walletId: string,
    pinned: boolean,
    pinOnMain: boolean,
  ): Promise<Wallet> {
    const { data } = await axiosInstance.put(
      `${API_MAP.WALLETS.WALLETS}/${walletId}/pin`,
      { pinned, pinOnMain },
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async updateWallet(
    walletId: string,
    payload: CreateWalletRequest,
  ): Promise<Wallet> {
    const validated = CreateWalletSchema.parse(payload);
    const { data } = await axiosInstance.put(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
      validated,
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async getWalletById(walletId: string): Promise<Wallet> {
    const { data } = await axiosInstance.get(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
    );
    return WalletSchema.parse(data);
  }

  public static async updateBalanceStatus(
    walletId: string,
    balanceStatus: string,
  ): Promise<Wallet> {
    const { data } = await axiosInstance.patch(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
      { balanceStatus },
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async toggleActive(
    walletId: string,
    active: boolean,
  ): Promise<Wallet> {
    const { data } = await axiosInstance.patch(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
      { active },
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async deleteWallet(
    walletId: string,
  ): Promise<string | undefined> {
    const { data } = await axiosInstance.delete(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
    );

    return data?.message;
  }

  public static async toggleVisible(
    walletId: string,
    visible: boolean,
  ): Promise<Wallet> {
    const { data } = await axiosInstance.patch(
      `${API_MAP.WALLETS.WALLETS}/${walletId}`,
      { visible },
    );
    const wallet = data?.wallet ?? data;
    return WalletSchema.parse(wallet);
  }

  public static async getWalletMonthlyLimit(walletId: string): Promise<{
    message: string;
    limit: number | null;
    spent: number;
    remaining: number | null;
    currencyCode: string;
  }> {
    const { data } = await axiosInstance.get(
      `${API_MAP.WALLETS.WALLETS}/${walletId}/monthly-limit`,
    );
    return data;
  }
}
