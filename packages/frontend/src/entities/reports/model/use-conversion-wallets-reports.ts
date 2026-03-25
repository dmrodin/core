import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ReportsService } from '@/entities/reports/api/reports-service';
import { ReportsConversionWallets } from '@/entities/reports/model/reports-schemas';

export const useConversionWalletsReport = () => {
    return useMutation({
        mutationKey: ['report', 'conversion-wallets'],
        mutationFn: (filters: ReportsConversionWallets) => ReportsService.getConversionWalletsReport(filters),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'conversion-wallets-report.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Отчёт скачивается!');
        },
    });
};
