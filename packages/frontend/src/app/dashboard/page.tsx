import type { Metadata } from 'next';

import { DashboardPinnedWallets } from '@/features/dashboard/ui/dashboard-pinned-wallets/dashboard-pinned-wallets';

export const metadata: Metadata = {
    title: 'Панель управления',
};

export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-4 max-w-5xl mx-auto">
            <DashboardPinnedWallets />
        </div>
    );
}
