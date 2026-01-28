import { AxiosError } from 'axios';

/**
 * Извлекает сообщение об ошибке из различных типов ошибок
 * @param error - ошибка любого типа
 * @param defaultMessage - сообщение по умолчанию
 * @returns читаемое сообщение об ошибке
 */
export const getErrorMessage = (error: unknown, defaultMessage = 'Произошла ошибка'): string => {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
        const axiosError = error as AxiosError<{
            message?: string;
            error?: string;
        }>;

        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }

        if (axiosError.response?.status) {
            const status = axiosError.response.status;
            switch (status) {
                case 400:
                    return 'Неверный запрос';
                case 401:
                    return 'Необходима авторизация';
                case 403:
                    return 'Доступ запрещен';
                case 404:
                    return 'Не найдено';
                case 409:
                    return 'Конфликт данных';
                case 500:
                    return 'Ошибка сервера';
                default:
                    return `Ошибка ${status}`;
            }
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return defaultMessage;
};
