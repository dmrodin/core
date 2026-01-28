import { z } from 'zod';

export const MonthlyAnalyticsItemSchema = z.object({
    month: z.string(),
    coming: z.number(),
    expenditure: z.number(),
    netFlow: z.number(),
    operationsCount: z.number(),
});

export const GetWalletMonthlyAnalyticsResponseSchema = z.object({
    message: z.string(),
    analytics: z.array(MonthlyAnalyticsItemSchema),
});

export type MonthlyAnalyticsItem = z.infer<typeof MonthlyAnalyticsItemSchema>;
export type GetWalletMonthlyAnalyticsResponse = z.infer<typeof GetWalletMonthlyAnalyticsResponseSchema>;
