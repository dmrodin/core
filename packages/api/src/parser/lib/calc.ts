export const P2P_BASE_RUB = 1_000_000;
export const P2P_RATE_MARKUP = 1.015;
export const DC_BASE_RUB = 990_000;

export type RateInputs = {
    usdtRub: number | null;
    usdtTjs: number | null;
    tinkoff: number | null;
    sberCourse: number | null;
};

export type DcRoute = {
    label: string;
    value: number;
    deviationPct: number | null;
};

export type RouteCalculation = {
    p2p: number | null;
    dcs: DcRoute[];
    bestValue: number | null;
};

function computeDc(bankRate: number | null, usdtTjs: number | null): number | null {
    if (!bankRate || !usdtTjs || bankRate <= 0 || usdtTjs <= 0) {
        return null;
    }

    return DC_BASE_RUB / bankRate / usdtTjs;
}

export function calcRoutes(rates: RateInputs): RouteCalculation {
    const { usdtRub, usdtTjs, tinkoff, sberCourse } = rates;

    const p2p = usdtRub && usdtRub > 0 ? P2P_BASE_RUB / (usdtRub * P2P_RATE_MARKUP) : null;

    const tinkoffDc = computeDc(tinkoff, usdtTjs);
    const sberDc = computeDc(sberCourse, usdtTjs);

    const dcs: DcRoute[] = [];
    const pushDc = (label: string, value: number | null) => {
        if (value === null) {
            return;
        }
        const deviationPct = p2p && p2p > 0 ? ((value - p2p) / p2p) * 100 : null;

        dcs.push({ label, value, deviationPct });
    };

    pushDc('Т-банк', tinkoffDc);
    pushDc('Сбер', sberDc);

    const candidates = [p2p, ...dcs.map((d) => d.value)].filter((v): v is number => v !== null);
    const bestValue = candidates.length > 0 ? Math.max(...candidates) : null;

    return { p2p, dcs, bestValue };
}

export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
