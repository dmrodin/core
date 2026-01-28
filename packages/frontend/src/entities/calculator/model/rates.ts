import { z } from 'zod';

const rateValueSchema = z.object({
    value: z.number().nullable(),
    override: z.boolean(),
});

const xeInfoSchema = rateValueSchema.extend({
    fallback_used: z.boolean(),
});

const tgRegionSchema = z.object({
    eur_per_usdt: rateValueSchema,
    eur_usdt_coefficient: rateValueSchema,
});

const marginTierSchema = z.object({
    min_eur: z.number(),
    max_eur: z.number().nullable(),
    coefficient: z.number(),
});

const commissionRowSchema = z.object({
    tier_eur: z.number(),
    office: z.number(),
    msk_field: z.number(),
    regions: z.number(),
});

const fintechRateSchema = z.object({
    buy: rateValueSchema,
    sell: rateValueSchema,
});

export const ratesSnapshotSchema = z.object({
    updated_at: z.string().nullable(),
    rapira: rateValueSchema,
    cbr: z.object({
        rub_per_eur: rateValueSchema,
        rub_per_usd: rateValueSchema,
    }),
    xe: xeInfoSchema,
    tg: z.object({
        serbia: tgRegionSchema,
        montenegro: tgRegionSchema,
    }),
    usd_variants: z.object({
        usd: rateValueSchema,
    }),
    fintech: z.object({
        usd_white: fintechRateSchema,
        usd_blue: fintechRateSchema,
        eur: fintechRateSchema,
        timestamp: z.string().nullable(),
    }),
    business: z.object({
        rapira_multiplier: z.number(),
        margin_tiers: z.array(marginTierSchema),
        commission_table: z.array(commissionRowSchema),
        rsd_per_eur: rateValueSchema,
    }),
});

export type RatesSnapshot = z.infer<typeof ratesSnapshotSchema>;
export type RateValue = z.infer<typeof rateValueSchema>;
export type MarginTier = z.infer<typeof marginTierSchema>;
export type CommissionRow = z.infer<typeof commissionRowSchema>;
export type FintechRate = z.infer<typeof fintechRateSchema>;
