import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

import {
    CreateBankRequest,
    GetBanksResponse,
    GetBanksResponseSchema,
    Bank,
    BankSchema,
    UpdateBankRequest,
} from '../model/bank-schemas';

export class BankService {
    public static async getBanks(): Promise<GetBanksResponse> {
        const { data } = await axiosInstance.get(API_MAP.BANKS.BANKS);
        return GetBanksResponseSchema.parse(data);
    }

    public static async getBankById(id: string): Promise<Bank> {
        const { data } = await axiosInstance.get(API_MAP.BANKS.BANK_BY_ID(id));
        return BankSchema.parse(data);
    }

    public static async createBank(payload: CreateBankRequest): Promise<Bank> {
        const { data } = await axiosInstance.post(API_MAP.BANKS.BANKS, payload);
        return BankSchema.parse(data);
    }

    public static async updateBank(id: string, payload: UpdateBankRequest): Promise<Bank> {
        const { data } = await axiosInstance.put(API_MAP.BANKS.BANK_BY_ID(id), payload);
        return BankSchema.parse(data);
    }

    public static async deleteBank(id: string): Promise<void> {
        await axiosInstance.delete(API_MAP.BANKS.BANK_BY_ID(id));
    }

    public static async restoreBank(id: string): Promise<void> {
        await axiosInstance.patch(API_MAP.BANKS.BANK_BY_ID(id));
    }
}
