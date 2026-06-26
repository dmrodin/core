import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../common/services/prisma.service';
import { TelegramService } from '../feedback/telegram.service';
import { TelegramBotType } from '../feedback/types/telegram-bot.types';
import { calcRoutes, DC_BASE_RUB, P2P_BASE_RUB, P2P_RATE_MARKUP, round2 } from '../parser/lib/calc';

const SBER_RATES_URL =
    'https://www.sberbank.ru/proxy/services/rates/public/v2/actual?rateType=ERNP-70&isoCodes[]=TJS&regionId=099';

const SBER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    Referer: 'https://www.sberbank.ru/ru/quotes/currencies',
    Accept: 'application/json',
};

const TAJIK_RATES_URL = 'https://mm-proxy-api-staging.up.railway.app/parser/get-tajik';

interface SberTjsPayload {
    TJS?: { lotSize?: number; rateList?: { rateSell?: number }[] };
}

interface TajikRates {
    usdtRub: number | null;
    usdtTjs: number | null;
    tinkoff: number | null;
}

interface Snapshot {
    p2p: number | null;
    tinkoffDc: number | null;
    sberDc: number | null;
}

@Injectable()
export class SberRateJobService {
    private readonly logger = new Logger(SberRateJobService.name);

    private lastSnapshot: Snapshot | null = null;

    constructor(
        private readonly prisma: PrismaService,
        private readonly telegram: TelegramService,
    ) {}

    @Cron('*/15 * * * *', { timeZone: 'UTC' })
    public async handleSberRateFetch(): Promise<void> {
        try {
            const sberCourse = await this.fetchSberCourse();

            if (sberCourse === null) {
                return;
            }

            await this.prisma.parserData.create({ data: { sberCourse } });
            this.logger.log(`Sber TJS course saved: ${sberCourse}`);

            // Telegram-отбивка «Курсы P2P/DC обновились» отключена — раскомментируй строку ниже, чтобы вернуть.
            // await this.notifyIfChanged(sberCourse);
        } catch (err) {
            this.logger.error('Sber rate job failed', err instanceof Error ? err.stack : undefined);
        }
    }

    private async fetchSberCourse(): Promise<number | null> {
        const res = await fetch(SBER_RATES_URL, { headers: SBER_HEADERS });

        if (!res.ok) {
            this.logger.warn(`Sber API non-OK: ${res.status}`);

            return null;
        }

        const json = (await res.json()) as SberTjsPayload;
        const lotSize = json?.TJS?.lotSize;
        const rateSell = json?.TJS?.rateList?.[0]?.rateSell;

        if (!lotSize || !rateSell || lotSize <= 0) {
            this.logger.warn('Sber payload missing TJS.lotSize/rateSell');

            return null;
        }

        return round2(rateSell / lotSize);
    }

    private async fetchTajikRates(): Promise<TajikRates> {
        try {
            const res = await fetch(TAJIK_RATES_URL, { headers: { Accept: 'application/json' } });

            if (!res.ok) {
                this.logger.warn(`Tajik proxy non-OK: ${res.status}`);

                return { usdtRub: null, usdtTjs: null, tinkoff: null };
            }

            const json = (await res.json()) as unknown;

            if (!Array.isArray(json) || typeof json[0] !== 'object' || json[0] === null) {
                this.logger.warn('Tajik proxy returned unexpected shape');

                return { usdtRub: null, usdtTjs: null, tinkoff: null };
            }

            const response = (json[0] as { response?: Record<string, unknown> }).response ?? {};
            const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

            return {
                usdtRub: num(response.usdt_rub),
                usdtTjs: num(response.usdt_tjs),
                tinkoff: num(response.tinkoff),
            };
        } catch (err) {
            this.logger.warn(`Tajik fetch failed: ${err instanceof Error ? err.message : String(err)}`);

            return { usdtRub: null, usdtTjs: null, tinkoff: null };
        }
    }

    private async notifyIfChanged(sberCourse: number): Promise<void> {
        const tajik = await this.fetchTajikRates();

        const calc = calcRoutes({
            usdtRub: tajik.usdtRub,
            usdtTjs: tajik.usdtTjs,
            tinkoff: tajik.tinkoff,
            sberCourse,
        });

        const tinkoffDc = calc.dcs.find((d) => d.label === 'Т-банк')?.value ?? null;
        const sberDc = calc.dcs.find((d) => d.label === 'Сбер')?.value ?? null;

        const snapshot: Snapshot = {
            p2p: calc.p2p !== null ? round2(calc.p2p) : null,
            tinkoffDc: tinkoffDc !== null ? round2(tinkoffDc) : null,
            sberDc: sberDc !== null ? round2(sberDc) : null,
        };

        if (snapshot.p2p === null && snapshot.tinkoffDc === null && snapshot.sberDc === null) {
            return;
        }

        if (this.lastSnapshot && this.snapshotsEqual(this.lastSnapshot, snapshot)) {
            return;
        }

        const message = this.formatMessage(calc, {
            usdtRub: tajik.usdtRub,
            usdtTjs: tajik.usdtTjs,
            tinkoff: tajik.tinkoff,
            sberCourse,
        });

        try {
            await this.telegram.sendMessage(TelegramBotType.FEEDBACK, message);
            this.lastSnapshot = snapshot;
        } catch (err) {
            this.logger.warn(`Telegram send failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    private snapshotsEqual(a: Snapshot, b: Snapshot): boolean {
        return a.p2p === b.p2p && a.tinkoffDc === b.tinkoffDc && a.sberDc === b.sberDc;
    }

    private formatMessage(
        calc: ReturnType<typeof calcRoutes>,
        sources: { usdtRub: number | null; usdtTjs: number | null; tinkoff: number | null; sberCourse: number },
    ): string {
        const lines: string[] = ['📊 Курсы P2P/DC обновились', ''];

        const isBest = (v: number | null) => v !== null && calc.bestValue !== null && v === calc.bestValue;
        const ratesByLabel = new Map(
            calc.dcs.map((d) => [
                d.label,
                {
                    rate: d.label === 'Т-банк' ? sources.tinkoff : d.label === 'Сбер' ? sources.sberCourse : null,
                },
            ]),
        );

        if (calc.p2p !== null && sources.usdtRub !== null) {
            const header = `P2P: ${formatUsdt(calc.p2p)} USDT`;

            lines.push(isBest(calc.p2p) ? `<b>${header}</b>` : header);
            lines.push(`${formatBase(P2P_BASE_RUB)} / (${formatRate(sources.usdtRub)} × ${P2P_RATE_MARKUP})`, '');
        }

        for (const dc of calc.dcs) {
            if (sources.usdtTjs === null) {
                continue;
            }
            const bankRate = ratesByLabel.get(dc.label)?.rate;

            if (bankRate === null || bankRate === undefined) {
                continue;
            }

            const dev = dc.deviationPct !== null ? ` (${formatPct(dc.deviationPct)})` : '';
            const header = `DC ${dc.label}: ${formatUsdt(dc.value)} USDT${dev}`;

            lines.push(isBest(dc.value) ? `<b>${header}</b>` : header);
            lines.push(`${formatBase(DC_BASE_RUB)} / ${formatRate(bankRate)} / ${formatRate(sources.usdtTjs)}`, '');
        }

        return lines.join('\n').trimEnd();
    }
}

function formatUsdt(n: number): string {
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBase(n: number): string {
    return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

function formatRate(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(n: number): string {
    const sign = n >= 0 ? '+' : '';

    return `${sign}${n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
