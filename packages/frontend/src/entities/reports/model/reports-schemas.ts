import { z } from 'zod';

export const ReportsGeneralSchema = z.object({
    dateStart: z.string().datetime(),
    dateEnd: z.string().datetime(),
    operationTypeId: z.string().uuid(),
    typeUnloading: z.array(z.string()).min(1, 'Выберите хотя бы один тип'),
});

export const ReportsConversionSchema = z.object({
    dateStart: z.string().datetime(),
    dateEnd: z.string().datetime(),
    operationTypeId: z.string().uuid(),
});

export const ReportsPeriodSchema = z.object({
    walletTypes: z.array(z.string()).min(1, 'Выберите хотя бы один тип'),
});

export const ReportsBalancesSchema = z.object({
    snapshotAt: z.string().datetime(),
    sections: z.array(z.string()).min(1, 'Выберите хотя бы один раздел'),
});

export type ReportsGeneral = z.infer<typeof ReportsGeneralSchema>;
export type ReportsConversion = z.infer<typeof ReportsConversionSchema>;
export type ReportsPeriod = z.infer<typeof ReportsPeriodSchema>;
export type ReportsBalances = z.infer<typeof ReportsBalancesSchema>;
