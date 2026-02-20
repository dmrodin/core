'use client';

import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 992;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
    const [isTablet, setIsTablet] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const mqlTablet = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);

        const onChange = () => {
            setIsMobile(mql.matches);
            setIsTablet(mqlTablet.matches);
        };

        mql.addEventListener('change', onChange);
        mqlTablet.addEventListener('change', onChange);
        onChange();

        return () => {
            mql.removeEventListener('change', onChange);
            mqlTablet.removeEventListener('change', onChange);
        };
    }, []);

    return { isMobile, isTablet };
}
