import type { TajikRates } from '../model/parser-rates-schemas';

export const P2P_BASE_RUB = 1_000_000;
export const P2P_RATE_MARKUP = 1.015;
export const DC_BASE_RUB = 990_000;

export type RouteCalculation = {
    p2p: number | null;
    dc: number | null;
    allPresent: boolean;
};

export function calcRoutes(rates: TajikRates): RouteCalculation {
    const usdtRub = rates.usdtRub ?? null;
    const usdtTjs = rates.usdtTjs ?? null;
    const tinkoff = rates.tinkoff ?? null;

    const p2p = usdtRub && usdtRub > 0 ? P2P_BASE_RUB / (usdtRub * P2P_RATE_MARKUP) : null;
    const dc = tinkoff && usdtTjs && tinkoff > 0 && usdtTjs > 0 ? DC_BASE_RUB / tinkoff / usdtTjs : null;
    const allPresent = Boolean(usdtRub && usdtTjs && tinkoff);

    return { p2p, dc, allPresent };
}

export function formatUsdtRu(n: number): string {
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' ');
}
