import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ReportsService } from '@/entities/reports/api/reports-service';
import { ReportsGeneral } from '@/entities/reports/model/reports-schemas';

export const useGeneralReport = () => {
    return useMutation({
        mutationKey: ['report', 'general'],
        mutationFn: (filters: ReportsGeneral) => ReportsService.getGeneralReport(filters),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'general-report.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Общий отчёт скачивается!');
        },
    });
};
