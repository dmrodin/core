import { z } from 'zod';

export const TajikRatesPayloadSchema = z.object({
    usdt_rub: z.number().nullable().optional(),
    usdt_tjs: z.number().nullable().optional(),
    tinkoff: z.number().nullable().optional(),
});

export const TajikRatesRawResponseSchema = z.tuple([z.object({ response: TajikRatesPayloadSchema }), z.number()]);

export type TajikRates = {
    usdtRub: number | null;
    usdtTjs: number | null;
    tinkoff: number | null;
};

export function parseTajikRatesResponse(raw: unknown): TajikRates {
    const [{ response }] = TajikRatesRawResponseSchema.parse(raw);
    return {
        usdtRub: response.usdt_rub ?? null,
        usdtTjs: response.usdt_tjs ?? null,
        tinkoff: response.tinkoff ?? null,
    };
}
