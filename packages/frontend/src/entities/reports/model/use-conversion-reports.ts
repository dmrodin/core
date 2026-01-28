import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ReportsService } from '@/entities/reports/api/reports-service';
import { ReportsConversion } from '@/entities/reports/model/reports-schemas';

export const useConversionReport = () => {
    return useMutation({
        mutationKey: ['report', 'conversion'],
        mutationFn: (filters: ReportsConversion) => ReportsService.getConversionReport(filters),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'conversion-report.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Отчёт скачивается!');
        },
    });
};
