'use client';

import { ReportGeneralForm } from '@/entities/reports';
import { ReportsConversionForm } from '@/entities/reports';
import { ReportsPeriodForm } from '@/entities/reports';
import { usePopapStore } from '@/entities/reports';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/shadcn/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';

export function ReportsSheet() {
    const active = usePopapStore((state) => state.active);
    const setActive = usePopapStore((state) => state.setActive);
    return (
        <div>
            <Sheet open={active} onOpenChange={setActive}>
                {active && (
                    <SheetContent className="pt-9">
                        <SheetHeader>
                            <SheetTitle>Формирование отчета</SheetTitle>
                            <SheetDescription>Заполните поля для формирования отчёта</SheetDescription>
                        </SheetHeader>
                        <Tabs defaultValue="general" className="w-[400px]">
                            <TabsList className="ml-4 mb-6">
                                <TabsTrigger value="general">Общий</TabsTrigger>
                                <TabsTrigger value="conversions">По конвертациям</TabsTrigger>
                                <TabsTrigger value="period">По остаткам</TabsTrigger>
                            </TabsList>
                            <TabsContent value="general" className="px-4">
                                <ReportGeneralForm />
                            </TabsContent>
                            <TabsContent value="conversions" className="px-4">
                                <ReportsConversionForm />
                            </TabsContent>
                            <TabsContent value="period" className="px-4">
                                <ReportsPeriodForm />
                            </TabsContent>
                        </Tabs>
                    </SheetContent>
                )}
            </Sheet>
        </div>
    );
}
