import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/shared/lib/env-config';
import { verifyJwtToken } from '@/shared/lib/jwt-utils';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname, search } = request.nextUrl;
    const isLoginRoute = pathname === ROUTER_MAP.LOGIN;

    let hasValidToken = false;
    let cookieToDelete: string | undefined;

    if (env.USE_DEV_AUTH_MARKER) {
        const authMarker = request.cookies.get('auth_marker')?.value;
        hasValidToken = authMarker === 'authenticated';
        cookieToDelete = authMarker ? 'auth_marker' : undefined;
    } else {
        const refreshToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_COOKIE_KEY)?.value;

        hasValidToken = refreshToken ? (await verifyJwtToken(refreshToken)) !== null : false;
        cookieToDelete = refreshToken ? env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_COOKIE_KEY : undefined;
    }

    if (!hasValidToken && !isLoginRoute) {
        const loginUrl = new URL(ROUTER_MAP.LOGIN, request.url);
        const nextPath = pathname + (search || '');

        if (nextPath && nextPath !== ROUTER_MAP.LOGIN) {
            loginUrl.searchParams.set('next', nextPath);
        }

        const response = NextResponse.redirect(loginUrl);
        if (cookieToDelete) {
            response.cookies.delete(cookieToDelete);
        }
        return response;
    }

    if (hasValidToken && isLoginRoute) {
        const dashboardUrl = new URL(ROUTER_MAP.DASHBOARD, request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
