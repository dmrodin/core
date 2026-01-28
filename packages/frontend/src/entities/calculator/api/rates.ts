import { type RatesSnapshot, ratesSnapshotSchema } from '@/entities/calculator/model/rates';
import { axiosInstance } from '@/shared';

export async function fetchRatesSnapshot(): Promise<RatesSnapshot> {
    const response = await axiosInstance.get('/parser/rates-snapshot');
    return ratesSnapshotSchema.parse(response.data);
}
