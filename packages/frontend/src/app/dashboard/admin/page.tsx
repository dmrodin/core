import { Metadata } from 'next';

import { LockedPeriodsPanel } from './locked-periods-panel';

export const metadata: Metadata = {
    title: 'Админ панель',
};

export default function AdminPanelPage() {
    return <LockedPeriodsPanel />;
}
