import { type JWTPayload, decodeJwt, jwtVerify } from 'jose';

import { type UserAuth, UserAuthSchema } from '@/entities/users/model/user-schemas';
import { env } from '@/shared/lib/env-config';

const textEncoder = new TextEncoder();
const secretKey = () => textEncoder.encode(env.JWT_SECRET);

/**
 * Верифицирует JWT токен с использованием `jose` (совместим с Edge runtime)
 * @param {string} token - JWT токен для верификации
 * @returns {Promise<JWTPayload | null>} Декодированный payload или null при ошибке
 */
export async function verifyJwtToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secretKey());
        return payload;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('JWTExpired')) {
            console.error('JWT токен истек:', message);
        } else if (message.includes('JWTInvalid') || message.includes('JWSSignatureVerificationFailed')) {
            console.error('Невалидный JWT токен:', message);
        } else {
            console.error('Ошибка верификации JWT токена:', error);
        }
        return null;
    }
}

/**
 * Декодирует JWT токен без верификации (для отладки)
 * @param {string} token - JWT токен для декодирования
 * @returns {UserAuth | null} Объект с данными пользователя или null при ошибке
 */
export function decodeJwtToken(token: string): UserAuth | null {
    try {
        const decoded = decodeJwt(token);

        if (!decoded || typeof decoded !== 'object') {
            return null;
        }

        const exp = typeof decoded.exp === 'number' ? decoded.exp : undefined;
        if (exp && Date.now() >= exp * 1000) {
            return null;
        }

        const userValidation = UserAuthSchema.safeParse(decoded);
        return userValidation.success ? userValidation.data : null;
    } catch (error) {
        console.error('Ошибка декодирования JWT токена:', error);
        return null;
    }
}
