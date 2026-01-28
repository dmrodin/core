import { z } from 'zod';

export const WalletAnalyticsItemSchema = z.object({
    walletId: z.string(),
    walletName: z.string(),
    walletCurrency: z.string(),
    holder: z.string().nullable(),
    currentBalance: z.number(),
    coming: z.number(),
    expenditure: z.number(),
    netFlow: z.number(),
    operationsCount: z.number(),
});

export const AnalyticsSummarySchema = z.object({
    totalWallets: z.number(),
    totalBalance: z.number(),
    totalComing: z.number(),
    totalExpenditure: z.number(),
    totalNetFlow: z.number(),
    totalOperations: z.number(),
    currencyBreakdown: z.record(z.string(), z.number()),
});

export const GetWalletAnalyticsResponseSchema = z.object({
    message: z.string(),
    analytics: z.array(WalletAnalyticsItemSchema),
    summary: AnalyticsSummarySchema,
});

export const GetWalletAnalyticsParamsSchema = z.object({
    walletId: z.string().uuid().optional(),
    currency: z.string().optional(),
    holder: z.string().optional(),
    dateStart: z.string().optional(),
    dateEnd: z.string().optional(),
    includeDeleted: z.boolean().optional(),
    includeCash: z.boolean().optional(),
    includeVisa: z.boolean().optional(),
});

export type WalletAnalyticsItem = z.infer<typeof WalletAnalyticsItemSchema>;
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;
export type GetWalletAnalyticsResponse = z.infer<typeof GetWalletAnalyticsResponseSchema>;
export type GetWalletAnalyticsParams = z.infer<typeof GetWalletAnalyticsParamsSchema>;
