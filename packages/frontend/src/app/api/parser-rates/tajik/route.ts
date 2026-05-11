import { NextResponse } from 'next/server';

import { env } from '@/shared/lib/env-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const upstream = await fetch(env.PARSER_TAJIK_URL, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
        });

        if (!upstream.ok) {
            return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
        }

        const data = await upstream.json();
        return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 502 });
    }
}
