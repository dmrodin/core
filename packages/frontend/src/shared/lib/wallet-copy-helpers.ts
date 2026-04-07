import type { Wallet } from '@/entities/wallet/model/wallet-schemas';

const warningText =
    'Убедительная просьба - переводить на строго указанные реквизиты и сумму, соблюдая все требования к переводу!\n' +
    'При переводе на некорректные реквизиты, а также при несоблюдении иных требований, мы не сможем провести обмен и возврат денежных средств!';

/**
 * Формирует текст реквизитов для копирования в зависимости от типа кошелька
 */
export const formatWalletRequisites = (wallet: Wallet): string | null => {
    const parts: string[] = [];
    const details = wallet.details;

    if (!details) {
        return null;
    }

    if (wallet.walletKind === 'crypto') {
        if (details.address) {
            parts.push(details.address);
        }

        const networkInfo: string[] = [];
        if (details.network?.name) {
            networkInfo.push(details.network.name);
        }
        if (details.networkType?.name) {
            networkInfo.push(details.networkType.name);
        }
        if (networkInfo.length > 0) {
            parts.push(`Сеть: ${networkInfo.join(' ')}`);
        }

        if (details.exchangeUid) {
            parts.push(`UID: ${details.exchangeUid}`);
        }

        if (details.username) {
            parts.push(`Username: ${details.username}`);
        }

        if (details.platform?.name) {
            parts.push(`Платформа: ${details.platform.name}`);
        }
    }

    if (wallet.walletKind === 'bank') {
        if (details.card) {
            parts.push(`Карта: ${details.card}`);
        }

        if (details.phone) {
            parts.push(`Телефон: ${details.phone}`);
        }

        if (details.ownerFullName) {
            parts.push(`Владелец: ${details.ownerFullName}`);
        }

        if (details.bank?.name) {
            parts.push(`Банк: ${details.bank.name}`);
        }

        if (details.accountId) {
            parts.push(`ID: ${details.accountId}`);
        }
    }

    if (wallet.walletKind === 'simple') {
        if (wallet.description) {
            parts.push(wallet.description);
        }
        if (details.phone) {
            parts.push(`Телефон: ${details.phone}`);
        }
        if (details.accountId) {
            parts.push(`ID: ${details.accountId}`);
        }
    }

    if (parts.length === 0) {
        return null;
    }

    return parts.join('\n');
};

/**
 * Формирует полный текст для копирования с предупреждением
 */
export const formatWalletCopyText = (wallet: Wallet): string | null => {
    const requisites = formatWalletRequisites(wallet);

    if (!requisites) {
        return null;
    }

    return `${warningText}

${requisites}`;
};

/**
 * Формирует краткий текст реквизитов для специальных случаев (Bybit, Trust и т.д.)
 */
export const formatSpecialWalletCopyText = (wallet: Wallet, template: string): string => {
    return `${warningText}

${template}`;
};

/**
 * Проверяет, является ли кошелек специальным (требует особой обработки)
 * Проверка по платформе из details
 */
export const isSpecialWallet = (wallet: Wallet): boolean => {
    const platformCode = wallet.details?.platform?.code;
    return platformCode === 'bybit' || platformCode === 'trust';
};

/**
 * Проверяет, является ли кошелек Bybit
 */
export const isBybitWallet = (wallet: Wallet): boolean => {
    const platformCode = wallet.details?.platform?.code;
    return platformCode === 'bybit';
};

/**
 * Проверяет, является ли кошелек Trust Wallet
 */
export const isTrustWallet = (wallet: Wallet): boolean => {
    const platformCode = wallet.details?.platform?.code;
    return platformCode === 'trust';
};

/**
 * Получает шаблон для специального кошелька
 */
export const getSpecialWalletTemplate = (wallet: Wallet): string | null => {
    const currency = wallet.currency.code;

    // Байбит - показываем шаблон для UID
    if (isBybitWallet(wallet)) {
        return `<${currency}>, UID Bybit:`;
    }

    // Траст - показываем шаблон для TRON с адресом
    if (isTrustWallet(wallet)) {
        const address = wallet.details?.address ?? '';
        return `<${currency}>, TRON (TRC-20):\n${address}`;
    }

    return null;
};

/**
 * Формирует текст для кнопки TRC (Bybit) — адрес с шаблоном TRON
 */
export const getBybitTrcCopyText = (wallet: Wallet): string => {
    const currency = wallet.currency.code;
    const address = wallet.details?.address ?? '';
    return `${warningText}\n\n<${currency}>, TRON (TRC-20):\n${address}`;
};

/**
 * Формирует текст для кнопки BB (Bybit) — UID с шаблоном
 */
export const getBybitBbCopyText = (wallet: Wallet): string => {
    const currency = wallet.currency.code;
    const uid = wallet.details?.exchangeUid ?? '';
    return `${warningText}\n\n<${currency}>, UID: \n${uid}\nПлатформа: Bybit`;
};
