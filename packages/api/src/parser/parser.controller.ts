import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../common/services/prisma.service';

@Controller('parser')
export class ParserController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('latest-bank-rates')
    public async getLatestBankRates(): Promise<{ sberCourse: number | null }> {
        const row = await this.prisma.parserData.findFirst({
            where: { sberCourse: { not: null } },
            orderBy: { createdAt: 'desc' },
            select: { sberCourse: true },
        });

        return { sberCourse: row?.sberCourse ? Number(row.sberCourse) : null };
    }

    @Get('rates-snapshot')
    public parseData() {
        return {
            updated_at: '2025-10-06T17:38:53.139417Z',
            rapira: {
                value: 83.01,
                override: false,
            },
            cbr: {
                rub_per_eur: {
                    value: 96.8345,
                    override: true,
                },
                rub_per_usd: {
                    value: 83.0,
                    override: true,
                },
            },
            xe: {
                value: 0.854,
                override: false,
                fallback_used: false,
            },
            tg: {
                serbia: {
                    eur_per_usdt: {
                        value: 110.0,
                        override: false,
                    },
                    eur_usdt_coefficient: {
                        value: 0.997,
                        override: false,
                    },
                },
                montenegro: {
                    eur_per_usdt: {
                        value: 110.0,
                        override: false,
                    },
                    eur_usdt_coefficient: {
                        value: 0.997,
                        override: false,
                    },
                },
            },
            usd_variants: {
                usd: {
                    value: 0.854,
                    override: false,
                },
            },
            fintech: {
                usd_white: {
                    buy: {
                        value: 81.8,
                        override: false,
                    },
                    sell: {
                        value: 82.6,
                        override: false,
                    },
                },
                usd_blue: {
                    buy: {
                        value: 82.4,
                        override: false,
                    },
                    sell: {
                        value: 83.1,
                        override: false,
                    },
                },
                eur: {
                    buy: {
                        value: 97.5,
                        override: false,
                    },
                    sell: {
                        value: 98.0,
                        override: false,
                    },
                },
                timestamp: null,
            },
            business: {
                rapira_multiplier: 0.999,
                margin_tiers: [
                    {
                        min_eur: 0.0,
                        max_eur: 20000.0,
                        coefficient: 0.975,
                    },
                    {
                        min_eur: 20000.0,
                        max_eur: 40000.0,
                        coefficient: 0.978,
                    },
                    {
                        min_eur: 40000.0,
                        max_eur: null,
                        coefficient: 0.98,
                    },
                ],
                commission_table: [
                    {
                        tier_eur: 100000.0,
                        office: 100.0,
                        msk_field: 120.0,
                        regions: 200.0,
                    },
                    {
                        tier_eur: 70000.0,
                        office: 100.0,
                        msk_field: 120.0,
                        regions: 180.0,
                    },
                    {
                        tier_eur: 50000.0,
                        office: 80.0,
                        msk_field: 100.0,
                        regions: 150.0,
                    },
                    {
                        tier_eur: 30000.0,
                        office: 80.0,
                        msk_field: 100.0,
                        regions: 150.0,
                    },
                    {
                        tier_eur: 20000.0,
                        office: 80.0,
                        msk_field: 100.0,
                        regions: 150.0,
                    },
                    {
                        tier_eur: 15000.0,
                        office: 80.0,
                        msk_field: 100.0,
                        regions: 150.0,
                    },
                    {
                        tier_eur: 10000.0,
                        office: 80.0,
                        msk_field: 100.0,
                        regions: 150.0,
                    },
                ],
                rsd_per_eur: {
                    value: 117.4,
                    override: false,
                },
            },
        };
    }
}
