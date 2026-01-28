'use server';

import { cookies } from 'next/headers';

/**
 * Server action used only in dev mode (no shared domain) to mark authentication state
 * on the frontend domain. The real refresh token stays on the API domain.
 */
export async function setAuthMarker(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set({
        name: 'auth_marker',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });
}

/**
 * Removes the dev auth marker cookie.
 */
export async function deleteAuthMarker(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete('auth_marker');
}
