'use client';

import { useState } from 'react';

import { ReportGeneralForm } from '@/entities/reports';
import { ReportsBalancesForm } from '@/entities/reports';
import { ReportsConversionForm } from '@/entities/reports';
import { ReportsConversionWalletsForm } from '@/entities/reports';
import { ReportsPeriodForm } from '@/entities/reports';
import { usePopapStore } from '@/entities/reports';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/shadcn/sheet';

type ReportType = 'general' | 'conversions' | 'conversions-wallets' | 'period' | 'balances';

export function ReportsSheet() {
    const active = usePopapStore((state) => state.active);
    const setActive = usePopapStore((state) => state.setActive);
    const [reportType, setReportType] = useState<ReportType>('general');

    return (
        <div>
            <Sheet open={active} onOpenChange={setActive}>
                {active && (
                    <SheetContent className="pt-9">
                        <SheetHeader>
                            <SheetTitle>Формирование отчета</SheetTitle>
                            <SheetDescription>Заполните поля для формирования отчета</SheetDescription>
                        </SheetHeader>

                        <div className="px-4 mt-6">
                            <div className="mb-6">
                                <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Выберите тип отчета" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">Общий</SelectItem>
                                        <SelectItem value="conversions">По конвертациям</SelectItem>
                                        <SelectItem value="conversions-wallets">
                                            По конвертациям (по разделам)
                                        </SelectItem>
                                        <SelectItem value="period">По остаткам</SelectItem>
                                        <SelectItem value="balances">По балансам</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {reportType === 'general' && <ReportGeneralForm />}
                            {reportType === 'conversions' && <ReportsConversionForm />}
                            {reportType === 'conversions-wallets' && <ReportsConversionWalletsForm />}
                            {reportType === 'period' && <ReportsPeriodForm />}
                            {reportType === 'balances' && <ReportsBalancesForm />}
                        </div>
                    </SheetContent>
                )}
            </Sheet>
        </div>
    );
}
