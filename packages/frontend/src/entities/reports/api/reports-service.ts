import {
    ReportsConversion,
    ReportsConversionSchema,
    ReportsGeneral,
    ReportsGeneralSchema,
    ReportsPeriod,
    ReportsPeriodSchema,
} from '@/entities/reports/model/reports-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';

export class ReportsService {
    public static async getGeneralReport(params?: ReportsGeneral): Promise<Blob> {
        const response = await axiosInstance.get('/operations/reports/general', {
            params: ReportsGeneralSchema.parse(params),
            responseType: 'blob',
        });
        return response.data as Blob;
    }

    public static async getConversionReport(params: ReportsConversion): Promise<Blob> {
        const response = await axiosInstance.get('/operations/reports/conversion', {
            params: ReportsConversionSchema.parse(params),
            responseType: 'blob',
        });
        return response.data as Blob;
    }

    public static async getPeriodReport(params: ReportsPeriod): Promise<Blob> {
        const response = await axiosInstance.get('/operations/reports/closing-period', {
            params: ReportsPeriodSchema.parse(params),
            responseType: 'blob',
        });
        return response.data as Blob;
    }
}
