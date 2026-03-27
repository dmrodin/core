import { API_MAP } from '@/shared/utils/constants/api-map';
import { axiosInstance } from '@/shared/api/axios-instance';

export interface RegulationItem {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

export class RegulationService {
    public static async getAll(): Promise<RegulationItem[]> {
        const response = await axiosInstance.get<{ regulations: RegulationItem[] }>(API_MAP.REGULATIONS.REGULATIONS);
        return response.data.regulations;
    }

    public static async upload(file: File): Promise<RegulationItem> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post<{ regulation: RegulationItem }>(
            API_MAP.REGULATIONS.REGULATIONS,
            formData,
        );
        return response.data.regulation;
    }

    public static async download(id: string): Promise<Blob> {
        const response = await axiosInstance.get(API_MAP.REGULATIONS.REGULATION_DOWNLOAD(id), {
            responseType: 'blob',
        });
        return response.data as Blob;
    }

    public static async delete(id: string): Promise<void> {
        await axiosInstance.delete(API_MAP.REGULATIONS.REGULATION_BY_ID(id));
    }
}
