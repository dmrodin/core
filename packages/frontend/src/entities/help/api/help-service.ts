import { CreateHelp, CreateHelpSchema } from '@/entities/help';
import { axiosInstance } from '@/shared';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class HelpService {
    /**
     * @param data
     * Создание обращения
     */
    public static async create(data: CreateHelp): Promise<void> {
        const validatedData = CreateHelpSchema.parse(data);
        await axiosInstance.post(API_MAP.FEEDBACK.FEEDBACK, validatedData);
    }
}
