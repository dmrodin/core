import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../common/services/prisma.service';

const SBER_RATES_URL =
    'https://www.sberbank.ru/proxy/services/rates/public/v2/actual?rateType=ERNP-70&isoCodes[]=TJS&regionId=099';

const SBER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    Referer: 'https://www.sberbank.ru/ru/quotes/currencies',
    Accept: 'application/json',
};

interface SberTjsPayload {
    TJS?: { lotSize?: number; rateList?: { rateSell?: number }[] };
}

@Injectable()
export class SberRateJobService {
    private readonly logger = new Logger(SberRateJobService.name);

    constructor(private readonly prisma: PrismaService) {}

    @Cron('*/15 * * * *', { timeZone: 'UTC' })
    public async handleSberRateFetch(): Promise<void> {
        try {
            const res = await fetch(SBER_RATES_URL, { headers: SBER_HEADERS });

            if (!res.ok) {
                this.logger.warn(`Sber API non-OK: ${res.status}`);

                return;
            }

            const json = (await res.json()) as SberTjsPayload;
            const lotSize = json?.TJS?.lotSize;
            const rateSell = json?.TJS?.rateList?.[0]?.rateSell;

            if (!lotSize || !rateSell || lotSize <= 0) {
                this.logger.warn('Sber payload missing TJS.lotSize/rateSell');

                return;
            }

            const course = Math.round((rateSell / lotSize) * 100) / 100;

            await this.prisma.parserData.create({ data: { sberCourse: course } });

            this.logger.log(`Sber TJS course saved: ${course}`);
        } catch (err) {
            this.logger.error('Sber rate fetch failed', err instanceof Error ? err.stack : undefined);
        }
    }
}
