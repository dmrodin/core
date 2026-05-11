import type { TajikRates } from '../model/parser-rates-schemas';

export const BASE_RUB = 985_000;

export type RouteCalculation = {
    p2p: number | null;
    dc: number | null;
    allPresent: boolean;
};

export function calcRoutes(rates: TajikRates): RouteCalculation {
    const usdtRub = rates.usdtRub ?? null;
    const usdtTjs = rates.usdtTjs ?? null;
    const tinkoff = rates.tinkoff ?? null;

    const p2p = usdtRub && usdtRub > 0 ? BASE_RUB / usdtRub : null;
    const dc = tinkoff && usdtTjs && tinkoff > 0 && usdtTjs > 0 ? BASE_RUB / tinkoff / usdtTjs : null;
    const allPresent = Boolean(usdtRub && usdtTjs && tinkoff);

    return { p2p, dc, allPresent };
}

export function formatUsdtRu(n: number): string {
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' ');
}
