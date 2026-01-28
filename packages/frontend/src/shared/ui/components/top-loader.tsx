'use client';

import NextTopLoader from 'nextjs-toploader';

export default function TopLoaderClient() {
    return (
        <NextTopLoader
            color="#79bce9"
            initialPosition={0.18}
            crawlSpeed={180}
            height={3}
            crawl
            showSpinner={false}
            shadow="0 0 10px #79bce980, 0 0 5px #79bce950"
            zIndex={9999}
        />
    );
}
