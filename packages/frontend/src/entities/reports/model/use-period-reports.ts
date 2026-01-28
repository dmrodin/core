import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ReportsService } from '@/entities/reports/api/reports-service';
import { ReportsPeriod } from '@/entities/reports/model/reports-schemas';

export const usePeriodReport = () => {
    return useMutation({
        mutationKey: ['report', 'period'],
        mutationFn: (filters: ReportsPeriod) => ReportsService.getPeriodReport(filters),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'period-report.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Отчёт скачивается!');
        },
    });
};
