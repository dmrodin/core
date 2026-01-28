import { redirect } from 'next/navigation';

import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export default function Home() {
    redirect(ROUTER_MAP.DASHBOARD);
}
