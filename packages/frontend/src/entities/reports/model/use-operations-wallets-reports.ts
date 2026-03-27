import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ReportsService } from '@/entities/reports/api/reports-service';
import { ReportsOperationsWallets } from '@/entities/reports/model/reports-schemas';

export const useOperationsWalletsReport = () => {
    return useMutation({
        mutationKey: ['report', 'operations-wallets'],
        mutationFn: (filters: ReportsOperationsWallets) => ReportsService.getOperationsWalletsReport(filters),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'operations-wallets-report.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Отчёт скачивается!');
        },
    });
};
