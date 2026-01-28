export const env = {
    NODE_ENV: process.env.NODE_ENV ?? '',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? '',
    NEXT_PUBLIC_AUTH_TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? '',
    NEXT_PUBLIC_AUTH_REFRESH_TOKEN_COOKIE_KEY: process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_COOKIE_KEY ?? '',
    JWT_SECRET: process.env.JWT_SECRET ?? '',
    USE_DEV_AUTH_MARKER: process.env.NEXT_PUBLIC_USE_DEV_AUTH_MARKER === 'true',
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
