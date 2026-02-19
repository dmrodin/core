import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

import {
    CreateLockedPeriodRequest,
    CreateLockedPeriodResponseSchema,
    GetLockedPeriodsResponseSchema,
    OpenLockedPeriodResponseSchema,
} from '../model/locked-period-schemas';

import type {
    CreateLockedPeriodResponse,
    GetLockedPeriodsResponse,
    OpenLockedPeriodResponse,
} from '../model/locked-period-schemas';

export const lockedPeriodApi = {
    getLockedPeriods: async (): Promise<GetLockedPeriodsResponse> => {
        const { data } = await axiosInstance.get(API_MAP.LOCKED_PERIODS.LOCKED_PERIODS);
        return GetLockedPeriodsResponseSchema.parse(data);
    },

    createLockedPeriod: async (dto: CreateLockedPeriodRequest): Promise<CreateLockedPeriodResponse> => {
        const { data } = await axiosInstance.post(API_MAP.LOCKED_PERIODS.LOCKED_PERIODS, dto);
        return CreateLockedPeriodResponseSchema.parse(data);
    },

    openLockedPeriod: async (id: string): Promise<OpenLockedPeriodResponse> => {
        const { data } = await axiosInstance.patch(API_MAP.LOCKED_PERIODS.OPEN_LOCKED_PERIOD(id));
        return OpenLockedPeriodResponseSchema.parse(data);
    },
};
