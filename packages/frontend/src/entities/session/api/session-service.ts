import {
    type DeactivateSessionsDto,
    DeactivateSessionsDtoSchema,
    type DeactivateSessionsResponseDto,
    DeactivateSessionsResponseDtoSchema,
    type GetSessionsResponseDto,
    GetSessionsResponseDtoSchema,
    type SessionResponseDto,
    SessionResponseDtoSchema,
} from '@/entities/session/model/session-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class SessionService {
    public static async getSessions(params?: { page?: number; limit?: number }): Promise<GetSessionsResponseDto> {
        const { data } = await axiosInstance.get(API_MAP.SESSIONS.MY_SESSIONS, {
            params,
        });
        return GetSessionsResponseDtoSchema.parse(data);
    }

    public static async getById(id: string): Promise<SessionResponseDto> {
        const { data } = await axiosInstance.get(API_MAP.SESSIONS.SESSION_BY_ID(id));
        return SessionResponseDtoSchema.parse(data);
    }

    public static async deactivateSessions(dto: DeactivateSessionsDto): Promise<DeactivateSessionsResponseDto> {
        const validated = DeactivateSessionsDtoSchema.parse(dto);
        const { data } = await axiosInstance.post(API_MAP.SESSIONS.DEACTIVATE_MY_SESSIONS, validated);
        return DeactivateSessionsResponseDtoSchema.parse(data);
    }

    public static async delete(id: string): Promise<void> {
        await axiosInstance.post(API_MAP.SESSIONS.DEACTIVATE_MY_SESSION_BY_ID(id));
    }
}
