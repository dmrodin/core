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
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        const onChangeTablet = () => {
            setIsTablet(window.innerWidth < TABLET_BREAKPOINT);
        };
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        mqlTablet.addEventListener('change', onChangeTablet);
        setIsMobile(window.innerWidth < TABLET_BREAKPOINT);
        return () => {
            mql.removeEventListener('change', onChange);
            mqlTablet.removeEventListener('change', onChangeTablet);
        };
    }, []);

    return { isMobile, isTablet };
}
