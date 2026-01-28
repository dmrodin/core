import {
    type CommissionRow,
    type MarginTier,
    type RateValue,
    type RatesSnapshot,
} from '@/entities/calculator/model/rates';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * КАЛЬКУЛЯТОР ОБМЕНА ВАЛЮТ РФ ↔ СЕРБИЯ/ЧЕРНОГОРИЯ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ:
 * Рассчитывает сколько клиент получит (или должен принести) при обмене валюты
 * между Россией и Сербией/Черногорией через криптовалюту (USDT).
 *
 * ДВА ОСНОВНЫХ СЦЕНАРИЯ:
 *
 * 1. ПРОДАЖА (РФ → Сербия/ЧГ):
 *    - Клиент приносит RUB/EUR/USD в Москве
 *    - Мы выдаем EUR/RSD в Сербии или ЧГ
 *    - Путь денег: RUB → USDT (Rapira) → EUR (TG бот за границей) → RSD (если надо)
 *
 * 2. ПОКУПКА (Сербия/ЧГ → РФ):
 *    - Клиент приносит EUR/RSD в Сербии/ЧГ
 *    - Мы выдаем RUB/EUR/USD в Москве
 *    - Путь денег: EUR ← USDT (TG бот) ← RUB (Rapira) ← целевая валюта (FinTech)
 *
 * ВАЖНЫЕ МОМЕНТЫ (для заказчика):
 *
 * КУРСЫ В РЕАЛЬНОМ ВРЕМЕНИ:
 *   - FinTech: обменник в РФ (EUR, USD белый/синий)
 *   - Rapira: крипто-обменник (RUB ↔ USDT)
 *   - XE: международный справочник курсов (USD/EUR)
 *   - TG боты: обменники в Сербии/ЧГ (парсим их курсы)
 *
 * ВЫЧЕТЫ (почему уменьшаем сумму):
 *   - Вознаграждение сотрудника: база 20 USD + комиссия по таблице
 *   - Расходы курьера: билеты/отель для регионов
 *   - ЭТО НЕ ДОБАВКИ! Мы вычитаем из суммы клиента, потому что:
 *     * Есть лимит 2,111,513 RUB на переводы
 *     * Сотрудник берет долю сразу, не везем её дальше
 *
 * ПРИБЫЛЬ:
 *   - Зависит от объема сделки (чем больше → тем меньше %)
 *   - Или фикс 1% для проверенных клиентов
 *   - Или кастомный процент (VIP/риски)
 *
 * РЕВЕРСИВНЫЙ РАСЧЕТ:
 *   - Обычный: "у меня есть X, сколько получу?"
 *   - Реверсивный: "мне нужно Y, сколько принести?"
 *   - Используем итеративный алгоритм (20 попыток), потому что
 *     все комиссии нелинейные (зависят от объема)
 *
 * СТРУКТУРА КОДА:
 * - Типы и интерфейсы (что на входе/выходе)
 * - Вспомогательные функции (курсы, комиссии, конвертация)
 * - performSale() - основная логика продажи
 * - performPurchase() - основная логика покупки
 * - solveReverseSale() - реверсивный расчет для продажи
 * - solveReversePurchase() - реверсивный расчет для покупки
 * - calculate() - главная функция-роутер
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Доступные страны для операций
 */
export type Country = 'serbia' | 'montenegro';

/**
 * Тип операции: продажа или покупка валюты
 */
export type Scenario = 'sale' | 'purchase';

/**
 * Место встречи с клиентом
 */
export type MeetingPlace = 'msk_office' | 'msk_field' | 'regions';

/**
 * Канал для расчета комиссий (соответствует местам встречи)
 */
export type CommissionChannel = 'office' | 'msk_field' | 'regions';

/**
 * Доступные входные валюты для операции продажи
 */
export type SaleInputCurrency = 'RUB' | 'EUR' | 'USD_WHITE' | 'USD_BLUE';

/**
 * Доступные выходные валюты для операции продажи
 */
export type SaleOutputCurrency = 'EUR' | 'RSD';

/**
 * Доступные входные валюты для операции покупки
 */
export type PurchaseInputCurrency = 'EUR' | 'RSD';

/**
 * Доступные выходные валюты для операции покупки
 */
export type PurchaseOutputCurrency = 'RUB' | 'EUR' | 'USD_WHITE' | 'USD_BLUE';

/**
 * Конфигурация коэффициента прибыли
 */
export type ProfitConfig = { mode: 'tier' } | { mode: 'trusted' } | { mode: 'custom'; coefficient: number };

/**
 * Базовые входные данные для расчета (общие для продажи и покупки)
 */
export interface BaseCalculationInput {
    /** Тип операции (продажа/покупка) */
    scenario: Scenario;
    /** Целевая страна операции */
    country: Country;
    /** Место встречи с клиентом */
    meetingPlace: MeetingPlace;
    /** Расходы в рублях (только для региональных встреч) */
    expensesRub: number;
    /** Конфигурация коэффициента прибыли */
    profit: ProfitConfig;
    /** Режим реверсивного расчета (от целевой суммы к входной) */
    reverseMode: boolean;
    /** Целевая сумма для реверсивного расчета */
    targetAmount?: number;
    /** Пользовательский коэффициент EUR/USDT (для покупки) */
    customEurPerUsdt?: number;
}

/**
 * Входные данные для операции продажи валюты
 */
export interface SaleInput extends BaseCalculationInput {
    scenario: 'sale';
    /** Входная валюта */
    inputCurrency: SaleInputCurrency;
    /** Выходная валюта */
    outputCurrency: SaleOutputCurrency;
    /** Сумма на входе */
    amount: number;
}

/**
 * Входные данные для операции покупки валюты
 */
export interface PurchaseInput extends BaseCalculationInput {
    scenario: 'purchase';
    /** Входная валюта */
    inputCurrency: PurchaseInputCurrency;
    /** Выходная валюта */
    outputCurrency: PurchaseOutputCurrency;
    /** Сумма на входе */
    amount: number;
}

/**
 * Объединенный тип входных данных для любой операции
 */
export type CalculatorInput = SaleInput | PurchaseInput;

/**
 * Описание курса валюты с метаданными
 */
export interface RateDescriptor {
    /** Название курса */
    label: string;
    /** Значение курса */
    value: number;
    /** Признак переопределения курса */
    override?: boolean;
    /** Признак использования резервного курса */
    fallbackUsed?: boolean;
    /** Источник курса */
    source?: string;
}

/**
 * Шаг расчета с суммой, валютой и курсом
 */
export interface CalculationStep {
    /** Описание шага */
    label: string;
    /** Сумма после шага */
    amount: number;
    /** Валюта суммы */
    currency: string;
    /** Курс, использованный в шаге */
    rate?: RateDescriptor;
    /** Дополнительная информация о шаге */
    note?: string;
    /** Формула расчета для отображения (например "100 × 94.2 = 9,420") */
    formula?: string;
    /** Предыдущая сумма (для формулы) */
    previousAmount?: number;
    /** Предыдущая валюта (для формулы) */
    previousCurrency?: string;
}

/**
 * Информация о комиссиях платформ
 */
export interface CommissionInfo {
    /** Канал расчета комиссии */
    channel: CommissionChannel;
    /** Тир комиссии (если применимо) */
    tier: CommissionRow | null;
    /** Комиссия в USD */
    usd: number | null;
    /** Комиссия в EUR */
    eur: number | null;
}

/**
 * Информация о расходах курьера
 */
export interface ExpensesInfo {
    /** Расходы в рублях */
    rub: number;
    /** Конвертированная сумма расходов */
    converted: number;
    /** Валюта конвертированной суммы */
    currency: string;
}

/**
 * Информация о марже и прибыли
 */
export interface MarginSummary {
    /** Сумма до применения маржи */
    baseAmount: number;
    /** Валюта базовой суммы */
    baseCurrency: string;
    /** Сумма после применения маржи */
    afterAmount: number;
    /** Валюта суммы после маржи */
    afterCurrency: string;
}

/**
 * Информация о комиссии сотрудника
 */
export interface EmployeeCommissionInfo {
    /** Комиссия в USD */
    usd: number;
    /** Эквивалент в рублях */
    rub: number;
    /** Эквивалент в евро (для расчета) */
    eurEquivalent: number;
}

/**
 * Полный результат расчета валютной операции
 */
export interface CalculationResult {
    /** Тип выполненной операции */
    scenario: Scenario;
    /** Целевая страна операции */
    country: Country;
    /** Место встречи с клиентом */
    meetingPlace: MeetingPlace;
    /** Входная валюта */
    inputCurrency: SaleInputCurrency | PurchaseInputCurrency;
    /** Входная сумма */
    inputAmount: number;
    /** Выходная валюта */
    outputCurrency: SaleOutputCurrency | PurchaseOutputCurrency;
    /** Выходная сумма */
    outputAmount: number;
    /** Целевая сумма (для реверсивного расчета) */
    targetAmount?: number;
    /** Пошаговое описание расчета */
    steps: CalculationStep[];
    /** Информация о комиссиях платформ */
    commission: CommissionInfo;
    /** Информация о расходах курьера (если применимо) */
    expenses?: ExpensesInfo;
    /** Информация о комиссии сотрудника */
    employeeCommission?: EmployeeCommissionInfo;
    /** Примененный коэффициент прибыли */
    profitCoefficient: number;
    /** Режим прибыли (tier/trusted/custom) */
    profitMode: ProfitConfig['mode'];
    /** Тир маржи (если применимо) */
    marginTier: MarginTier | null;
    /** Информация о марже и прибыли */
    margin: MarginSummary;
    /** Предупреждения расчета */
    warnings: string[];
    /** Временная метка поста FinTech (если доступна) */
    fintechTimestamp?: string | null;
    /** Расчетный курс RUB/EUR (для операций EUR→RUB) */
    rubPerEurCalc?: number | null;
    /** Курс ЦБ RUB/EUR для сравнения */
    cbrRubPerEur?: number | null;
}

/**
 * Исключение, выбрасываемое при ошибках расчета валютных операций
 */
export class CalculatorError extends Error {
    /** Массив проблем, вызвавших ошибку */
    public readonly issues: string[];

    constructor(issues: string[]) {
        super('Недостаточно данных для расчёта');
        this.name = 'CalculatorError';
        this.issues = issues;
    }
}

/**
 * Извлекает числовое значение курса из контейнера RateValue
 *
 * @param container - Контейнер с курсом валюты
 * @param label - Название курса для сообщений об ошибках
 * @param issues - Массив для накопления ошибок
 * @returns Значение курса или null если недоступно
 */
function resolveRate(container: RateValue | undefined, label: string, issues: string[]): number | null {
    const value = container?.value;
    if (value == null || Number.isNaN(value) || value <= 0) {
        issues.push(label);
        return null;
    }
    return value;
}

/**
 * Выбирает подходящий тир маржи для заданной суммы в EUR
 *
 * @param amountEur - Сумма в евро для определения тира
 * @param tiers - Массив доступных тиров маржи
 * @returns Подходящий тир маржи или null если не найден
 */
function pickMarginTier(amountEur: number, tiers: MarginTier[]): MarginTier | null {
    if (!tiers.length) {
        return null;
    }
    const sorted = [...tiers].sort((a, b) => a.min_eur - b.min_eur);
    let selected = sorted[0];
    for (const tier of sorted) {
        const withinMax = tier.max_eur == null || amountEur < tier.max_eur;
        if (amountEur >= tier.min_eur && withinMax) {
            return tier;
        }
        if (amountEur >= tier.min_eur) {
            selected = tier;
        }
    }
    return selected;
}

/**
 * Определяет коэффициент прибыли на основе конфигурации и тира маржи
 *
 * @param profit - Конфигурация прибыли (tier/trusted/custom)
 * @param marginTier - Тир маржи для определения базового коэффициента
 * @param issues - Массив для накопления ошибок валидации
 * @returns Коэффициент прибыли (0.98 для 2% прибыли, 0.99 для 1% и т.д.)
 */
function determineProfitCoefficient(profit: ProfitConfig, marginTier: MarginTier | null, issues: string[]): number {
    if (profit.mode === 'trusted') {
        return 0.99;
    }
    if (profit.mode === 'custom') {
        if (profit.coefficient == null || profit.coefficient <= 0 || profit.coefficient > 1.2) {
            issues.push('Некорректное значение пользовательского коэффициента прибыли');
            return marginTier?.coefficient ?? 1;
        }
        return profit.coefficient;
    }
    return marginTier?.coefficient ?? 1;
}

/**
 * Получает курс FinTech для указанной валюты и стороны операции
 *
 * @param snapshot - Снимок курсов валют
 * @param currency - Валюта ('usd_white', 'usd_blue', 'eur')
 * @param side - Сторона операции ('buy' или 'sell')
 * @returns Контейнер с курсом валюты
 */
function getFintechRate(
    snapshot: RatesSnapshot,
    currency: 'usd_white' | 'usd_blue' | 'eur',
    side: 'buy' | 'sell',
): RateValue {
    return snapshot.fintech[currency][side];
}

/**
 * Создает дескриптор курса валюты с метаданными
 *
 * @param label - Название курса
 * @param value - Значение курса
 * @param override - Признак переопределения курса
 * @param source - Источник курса
 * @param fallbackUsed - Признак использования резервного курса
 * @returns Дескриптор курса валюты
 */
function buildRateDescriptor(
    label: string,
    value: number,
    override = false,
    source?: string,
    fallbackUsed = false,
): RateDescriptor {
    return {
        label,
        value,
        override,
        source,
        fallbackUsed,
    };
}

/**
 * Конвертирует сумму из любой валюты в EUR для расчета комиссий
 *
 * @param amount - Сумма для конвертации
 * @param currency - Исходная валюта ('RUB', 'USD_WHITE', 'USD_BLUE', 'RSD', 'EUR')
 * @param snapshot - Снимок курсов валют
 * @returns Сумма в EUR или null если курс недоступен
 *
 * @example
 * ```typescript
 * const eurAmount = convertToEur(100000, 'RUB', snapshot); // 847.46 EUR (примерный расчет)
 * const eurAmount = convertToEur(1000, 'USD_WHITE', snapshot); // 920.00 EUR (примерный расчет)
 * ```
 */
function convertToEur(amount: number, currency: string, snapshot: RatesSnapshot): number | null {
    switch (currency) {
        case 'RSD': {
            const rsdPerEur = snapshot.business.rsd_per_eur.value;
            if (!rsdPerEur) return null;
            return amount / rsdPerEur;
        }
        case 'USD_WHITE':
        case 'USD_BLUE': {
            const usdToEur = snapshot.usd_variants.usd.value;
            if (!usdToEur) return null;
            return amount * usdToEur;
        }
        case 'RUB': {
            const rubToEur = snapshot.cbr.rub_per_eur.value;
            if (!rubToEur) return null;
            return amount / rubToEur;
        }
        case 'EUR':
        default:
            return amount;
    }
}

/**
 * Форматирует число с пробелами между тысячами для читаемости в формулах
 * Например: 1234567.89 → "1 234 567.89"
 */
function formatNumberWithSpaces(num: number, decimals: number = 2): string {
    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return decPart ? `${withSpaces}.${decPart}` : withSpaces;
}

/**
 * Рассчитывает ДИНАМИЧЕСКУЮ ЧАСТЬ вознаграждения сотрудника (без базовых 20 USD)
 *
 * ТАБЛИЦА ДЕНИСА:
 *
 * Это не просто фикс ставка, а прогрессивная система:
 * - Чем больше сделка → тем больше комиссия сотруднику (мотивация работать с крупными суммами)
 * - Чем дальше ехать → тем больше комиссия (компенсация за дорогу и время)
 *
 * ПОРОГИ И СТАВКИ:
 *
 * 1. ОФИС В МОСКВЕ (msk_office) - самые низкие ставки:
 *    - Сделка ≥ 100,000 EUR → комиссия 100 USD
 *    - Сделка ≥ 50,000 EUR → комиссия 80 USD
 *    - Сделка < 50,000 EUR → комиссия 80 USD (минимум)
 *
 * 2. ВЫЕЗД ПО МОСКВЕ (msk_field) - средние ставки:
 *    - Сделка ≥ 100,000 EUR → комиссия 120 USD
 *    - Сделка ≥ 70,000 EUR → комиссия 100 USD
 *    - Сделка < 70,000 EUR → комиссия 100 USD (минимум)
 *
 * 3. РЕГИОНЫ (regions) - высокие ставки (плюс еще расходы на билеты):
 *    - Сделка ≥ 100,000 EUR → комиссия 200 USD
 *    - Сделка ≥ 70,000 EUR → комиссия 180 USD
 *    - Сделка ≥ 50,000 EUR → комиссия 150 USD
 *    - Сделка < 50,000 EUR → комиссия 150 USD (минимум)
 *
 * ИТОГОВОЕ ВОЗНАГРАЖДЕНИЕ = 20 USD (база) + результат этой функции
 *
 * @param eurAmount - Объем сделки в EUR (от этого зависит порог)
 * @param meetingPlace - Где встречаемся с клиентом (от этого зависит таблица)
 * @returns Динамическая часть комиссии в USD (без базовых 20)
 *
 * @example
 * Сделка 100,000 EUR в офисе → 100 USD + база 20 USD = ИТОГО 120 USD
 * Сделка 50,000 EUR в регионах → 150 USD + база 20 USD = ИТОГО 170 USD (+ расходы на билеты)
 */
function calculateEmployeeCommission(eurAmount: number, meetingPlace: MeetingPlace): number {
    // Таблица порогов и комиссий (от Дениса)
    const commissionTiers = [
        { place: 'msk_office' as MeetingPlace, threshold: 100000, commission: 100 },
        { place: 'msk_office' as MeetingPlace, threshold: 50000, commission: 80 },

        { place: 'msk_field' as MeetingPlace, threshold: 100000, commission: 120 },
        { place: 'msk_field' as MeetingPlace, threshold: 70000, commission: 100 },

        { place: 'regions' as MeetingPlace, threshold: 100000, commission: 200 },
        { place: 'regions' as MeetingPlace, threshold: 70000, commission: 180 },
        { place: 'regions' as MeetingPlace, threshold: 50000, commission: 150 },
    ];

    const applicableTiers = commissionTiers.filter((tier) => tier.place === meetingPlace);

    for (const tier of applicableTiers.sort((a, b) => b.threshold - a.threshold)) {
        if (eurAmount >= tier.threshold) {
            return tier.commission;
        }
    }

    return applicableTiers[applicableTiers.length - 1]?.commission ?? 0;
}

function assertNoIssues(issues: string[]): void {
    if (issues.length > 0) {
        throw new CalculatorError(issues);
    }
}

interface SaleComputationOptions {
    input: SaleInput;
    snapshot: RatesSnapshot;
    amount: number;
    collectSteps: boolean;
}

interface SaleComputationResult {
    inputAmount: number;
    outputAmount: number;
    eurBeforeMargin: number;
    amountAfterMargin: number;
    marginTier: MarginTier | null;
    profitCoefficient: number;
    steps: CalculationStep[];
    expenses?: ExpensesInfo;
    employeeCommission?: EmployeeCommissionInfo;
    warnings: string[];
}

/**
 * ПРОДАЖА - когда клиент приносит нам валюту (RUB/EUR/USD) в РФ, а мы ему выдаем EUR/RSD в Сербии/ЧГ
 *
 * КАК ЭТО РАБОТАЕТ:
 *
 * 1. Клиент дает нам, например, 100,000 RUB в Москве
 * 2. Если регионы - вычитаем расходы курьера (билеты/отель)
 * 3. ВАЖНО: Вычитаем вознаграждение сотрудника в РФ
 *    - Почему вычитаем? Потому что у нас есть лимит 2,111,513 по переводам
 *    - Сотрудник берет свою долю ДО того, как мы отправляем деньги дальше
 *    - Это базовые 20 USD + комиссия по таблице (зависит от объема сделки)
 * 4. Оставшиеся рубли несем в Rapira (обменник) и покупаем USDT (крипта)
 *    - Rapira берет комиссию ~0.1%
 * 5. Эти USDT отправляем в Сербию/ЧГ, там продаем за EUR
 *    - Курс EUR/USDT берем из TG бота (там реальные курсы обменников)
 * 6. Применяем нашу прибыль (обычно 2-5%, зависит от объема)
 * 7. Если клиент хочет RSD - конвертируем EUR → RSD по фикс курсу
 * 8. Выдаем клиенту
 *
 * ПОЧЕМУ ИМЕННО ТАК:
 * - Мы не можем напрямую из РФ в Сербию перевести обычные деньги
 * - Поэтому используем USDT как мост между странами
 * - Все курсы реальные: FinTech (обменник в РФ), Rapira (обменник), TG боты (обменники за границей)
 *
 * @param input - Что хочет клиент (валюты, суммы, место встречи)
 * @param snapshot - Текущие курсы всех обменников (обновляются в реальном времени)
 * @param amount - Сколько клиент дает нам на входе
 * @param collectSteps - Нужно ли сохранять подробные шаги для отчета (true для UI, false для реверсивного расчета)
 * @returns Результат: сколько выдаем клиенту + все промежуточные шаги
 *
 * @throws {CalculatorError} Если нет курсов или сумма слишком маленькая
 */
function performSale({ input, snapshot, amount, collectSteps }: SaleComputationOptions): SaleComputationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const steps: CalculationStep[] = [];

    if (collectSteps) {
        steps.push({
            label: 'Сумма на входе',
            amount,
            currency: input.inputCurrency,
        });
    }

    const minEmployeeRewardUsd = 100;
    const estimatedUsdRate = snapshot.fintech.usd_white?.buy?.value || snapshot.fintech.usd_blue?.buy?.value || 80;
    const minRequiredRub = minEmployeeRewardUsd * estimatedUsdRate;

    let estimatedInputRub = amount;
    if (input.inputCurrency !== 'RUB') {
        const eurRate = snapshot.fintech.eur?.buy?.value || 100;
        const usdRate = snapshot.fintech.usd_white?.buy?.value || snapshot.fintech.usd_blue?.buy?.value || 80;
        if (input.inputCurrency === 'EUR') {
            estimatedInputRub = amount * eurRate;
        } else if (input.inputCurrency === 'USD_WHITE' || input.inputCurrency === 'USD_BLUE') {
            estimatedInputRub = amount * usdRate;
        }
    }

    if (collectSteps && estimatedInputRub < minRequiredRub) {
        warnings.push(
            `⚠️ Сумма может быть недостаточной. Минимальное вознаграждение сотрудника составляет около ${minRequiredRub.toFixed(0)} RUB (${minEmployeeRewardUsd} USD)`,
        );
    }

    let eurAmount = amount;

    let amountAfterMargin = 0;
    let marginTier: MarginTier | null = null;
    let profitCoefficient = 1;

    const addStep = (step: CalculationStep) => {
        if (collectSteps) steps.push(step);
    };

    const applyFintechConversion = (rateValue: RateValue | undefined, label: string): number | null => {
        const rate = resolveRate(rateValue, label, issues);
        if (rate == null) {
            return null;
        }
        return rate;
    };

    let rubAmount = 0;

    /** Шаг 1: Конвертация входной валюты в RUB через FinTech */
    switch (input.inputCurrency) {
        case 'EUR': {
            /** Конвертация EUR в RUB (покупаем EUR за рубли) */
            const rate = applyFintechConversion(
                getFintechRate(snapshot, 'eur', 'buy'),
                'FinTech: покупка EUR (курс RUB/EUR)',
            );
            if (rate != null) {
                rubAmount = amount * rate;
                addStep({
                    label: 'EUR → RUB (FinTech)',
                    amount: rubAmount,
                    currency: 'RUB',
                    rate: buildRateDescriptor('FinTech покупка EUR', rate, false, 'FinTech Exchange'),
                    formula: `${formatNumberWithSpaces(amount)} EUR × ${rate.toFixed(6)} = ${formatNumberWithSpaces(rubAmount)} RUB`,
                    previousAmount: amount,
                    previousCurrency: 'EUR',
                });
            }
            break;
        }
        case 'USD_WHITE': {
            /** Конвертация белого USD в RUB */
            const rate = applyFintechConversion(
                getFintechRate(snapshot, 'usd_white', 'buy'),
                'FinTech: покупка USD белый (курс RUB/USD)',
            );
            if (rate != null) {
                rubAmount = amount * rate;
                addStep({
                    label: 'USD бел. → RUB (FinTech)',
                    amount: rubAmount,
                    currency: 'RUB',
                    rate: buildRateDescriptor('FinTech покупка USD бел.', rate, false, 'FinTech Exchange'),
                    formula: `${formatNumberWithSpaces(amount)} USD × ${rate.toFixed(6)} = ${formatNumberWithSpaces(rubAmount)} RUB`,
                    previousAmount: amount,
                    previousCurrency: 'USD',
                });
            }
            break;
        }
        case 'USD_BLUE': {
            /** Конвертация синего USD в RUB */
            const rate = applyFintechConversion(
                getFintechRate(snapshot, 'usd_blue', 'buy'),
                'FinTech: покупка USD синий (курс RUB/USD)',
            );
            if (rate != null) {
                rubAmount = amount * rate;
                addStep({
                    label: 'USD син. → RUB (FinTech)',
                    amount: rubAmount,
                    currency: 'RUB',
                    rate: buildRateDescriptor('FinTech покупка USD син.', rate, false, 'FinTech Exchange'),
                    formula: `${formatNumberWithSpaces(amount)} USD × ${rate.toFixed(6)} = ${formatNumberWithSpaces(rubAmount)} RUB`,
                    previousAmount: amount,
                    previousCurrency: 'USD',
                });
            }
            break;
        }
        case 'RUB':
        default:
            rubAmount = amount;
            break;
    }

    /** Проверяем, что все необходимые курсы доступны */
    assertNoIssues(issues);

    /**
     * ШАГ 2: Конвертируем всю сумму в EUR для расчета комиссии сотрудника
     *
     * ЗАЧЕМ: Комиссия сотрудника зависит от объема сделки в EUR.
     * Есть таблица порогов (например: до 5000 EUR - одна ставка, от 5000 до 10000 - другая).
     * Поэтому нам нужно знать полный объем сделки в EUR ДО вычета комиссий.
     */
    const eurAmountForCommission = convertToEur(rubAmount, 'RUB', snapshot);
    if (eurAmountForCommission == null) {
        issues.push('Не удалось рассчитать сумму в EUR для комиссии сотрудника');
        return {
            inputAmount: amount,
            outputAmount: 0,
            eurBeforeMargin: 0,
            amountAfterMargin: 0,
            marginTier: null,
            profitCoefficient: 1,
            steps: [],
            expenses: undefined,
            warnings,
        };
    }

    /**
     * ШАГ 3: Рассчитываем и ВЫЧИТАЕМ вознаграждение сотрудника в РФ
     *
     * ПОЧЕМУ ВЫЧИТАЕМ:
     * - У нас есть лимит 2,111,513 RUB на переводы через систему
     * - Сотрудник в РФ берет свою долю СРАЗУ, из той суммы что принес клиент
     * - Дальше в Rapira/за границу идет уже МЕНЬШАЯ сумма
     * - Это не "добавка к расходам", это "вычет из суммы которую везем дальше"
     *
     * СТРУКТУРА ВОЗНАГРАЖДЕНИЯ:
     * - Базовая часть: всегда 20 USD (фикс)
     * - Динамическая часть: зависит от объема сделки в EUR и места встречи
     *   Таблица примерно такая:
     *   - Офис в Москве: меньше проценты
     *   - Выезд в Москве: средние проценты
     *   - Регионы: выше проценты (потому что ездить далеко)
     *
     * КОНВЕРТАЦИЯ:
     * - Комиссию считаем в EUR (потому что таблица порогов в EUR)
     * - Потом переводим в USD (потому что сотрудник хочет USD)
     * - Потом переводим в RUB (потому что вычитаем из рублей)
     */
    const baseEmployeeRewardUsd = 20; // Фиксированная база - всегда 20 USD
    const usdWhiteRate = getFintechRate(snapshot, 'usd_white', 'buy').value;
    const usdBlueRate = getFintechRate(snapshot, 'usd_blue', 'buy').value;
    const usdToRubRate = usdWhiteRate || usdBlueRate; // Берем любой доступный курс USD/RUB
    if (!usdToRubRate) {
        issues.push('Не удалось получить курс USD/RUB для расчета вознаграждения сотрудника');
        return {
            inputAmount: amount,
            outputAmount: 0,
            eurBeforeMargin: eurAmount,
            amountAfterMargin,
            marginTier,
            profitCoefficient,
            steps,
            expenses: undefined,
            warnings,
        };
    }
    const baseEmployeeRewardRub = baseEmployeeRewardUsd * usdToRubRate;
    rubAmount -= baseEmployeeRewardRub;

    const additionalEmployeeRewardUsd = calculateEmployeeCommission(eurAmountForCommission, input.meetingPlace);
    const additionalEmployeeRewardRub = additionalEmployeeRewardUsd * usdToRubRate;
    rubAmount -= additionalEmployeeRewardRub;

    const totalEmployeeRewardUsd = baseEmployeeRewardUsd + additionalEmployeeRewardUsd;
    const totalEmployeeRewardRub = totalEmployeeRewardUsd * usdToRubRate;

    const employeeCommissionInfo: EmployeeCommissionInfo = {
        usd: totalEmployeeRewardUsd,
        rub: totalEmployeeRewardRub,
        eurEquivalent: eurAmountForCommission,
    };

    if (rubAmount < 0) {
        issues.push(
            `Сумма недостаточна для покрытия вознаграждения сотрудника (требуется минимум ${totalEmployeeRewardRub.toFixed(2)} RUB)`,
        );
        assertNoIssues(issues);
    }

    const rubBeforeEmployeeReward = rubAmount + totalEmployeeRewardRub;
    addStep({
        label: 'Вознаграждение сотрудника в РФ',
        amount: rubAmount,
        currency: 'RUB',
        note: `Вычтено ${totalEmployeeRewardUsd.toFixed(2)} USD (базовое 20 + комиссия ${additionalEmployeeRewardUsd}) × ${usdToRubRate.toFixed(2)} RUB/USD = ${totalEmployeeRewardRub.toFixed(2)} RUB`,
        formula: `${formatNumberWithSpaces(rubBeforeEmployeeReward)} RUB − ${formatNumberWithSpaces(totalEmployeeRewardRub)} RUB = ${formatNumberWithSpaces(rubAmount)} RUB`,
        previousAmount: rubBeforeEmployeeReward,
        previousCurrency: 'RUB',
    });

    /** Шаг 4: Вычитаем расходы курьера (только для региональных встреч) */
    let expensesInfo: ExpensesInfo | undefined;
    if (input.meetingPlace === 'regions' && input.expensesRub > 0) {
        const rubBeforeExpenses = rubAmount;
        rubAmount = Math.max(rubAmount - input.expensesRub, 0);
        expensesInfo = {
            rub: input.expensesRub,
            converted: input.expensesRub,
            currency: 'RUB',
        };
        addStep({
            label: 'Расходы курьера (билеты/отель)',
            amount: rubAmount,
            currency: 'RUB',
            note: `Вычтено ${input.expensesRub.toFixed(2)} RUB расходов`,
            formula: `${formatNumberWithSpaces(rubBeforeExpenses)} RUB − ${formatNumberWithSpaces(input.expensesRub)} RUB = ${formatNumberWithSpaces(rubAmount)} RUB`,
            previousAmount: rubBeforeExpenses,
            previousCurrency: 'RUB',
        });
    }

    /** Шаг 5: Конвертация RUB в USDT через Rapira */
    const rapiraRate = resolveRate(snapshot.rapira, 'Курс USDT/RUB (Rapira)', issues);
    assertNoIssues(issues);

    /**
     * Конвертация через Rapira (обменник крипты)
     *
     * ЧТО ТАКОЕ RAPIRA:
     * - Это онлайн-обменник, где можно купить/продать криптовалюту
     * - Мы используем его как мост: RUB → USDT (крипту можно переслать в любую страну)
     * - Курс берем из их API в реальном времени
     *
     * КОМИССИЯ:
     * - Rapira берет ~0.1% (может чуть меняться)
     * - Это встроено в rapiraMultiplier (обычно 0.999)
     * - Формула: (рубли / курс_RUB_USDT) × множитель_комиссии = USDT
     *
     * ПРИМЕР:
     * - Есть 100,000 RUB
     * - Курс Rapira: 82.15 RUB за 1 USDT
     * - Множитель комиссии: 0.999 (то есть 0.1% заберет Rapira)
     * - Получим: (100,000 / 82.15) × 0.999 = 1,216.48 USDT
     */
    const rapiraMultiplier = snapshot.business.rapira_multiplier;
    const usdtAfterRapira = (rubAmount / rapiraRate!) * rapiraMultiplier;
    addStep({
        label: 'RUB → USDT (Rapira)',
        amount: usdtAfterRapira,
        currency: 'USDT',
        rate: buildRateDescriptor('Rapira курс', rapiraRate!, snapshot.rapira.override, 'Rapira'),
        note: `Комиссия платформы ${Math.round((1 - rapiraMultiplier) * 10000) / 100}%`,
        formula: `${formatNumberWithSpaces(rubAmount)} RUB ÷ ${rapiraRate!.toFixed(6)} × ${rapiraMultiplier.toFixed(4)} = ${formatNumberWithSpaces(usdtAfterRapira, 6)} USDT`,
        previousAmount: rubAmount,
        previousCurrency: 'RUB',
    });

    /**
     * ШАГ 6: Конвертация USDT в EUR через TG бота (продажа крипты за границей)
     *
     * ЧТО ТАКОЕ TG БОТ:
     * Это обменники в Сербии/ЧГ, которые работают через Telegram.
     * Мы отправляем им USDT, они дают нам EUR наличкой или переводом.
     * Курс берем из нашего бота, который парсит реальные курсы обменников.
     *
     * КАК СЧИТАЕТСЯ КУРС:
     * 1. Берем базовый курс USD/EUR из XE (международный справочник курсов)
     * 2. Умножаем на коэффициент страны:
     *    Сербия: обычно ~0.922 (обменники там берут больший спред)
     *    Черногория: обычно ~0.99 (там конкуренция выше, курсы лучше)
     * 3. Получаем итоговый курс EUR/USDT
     *
     * КАСТОМИЗАЦИЯ ("себестоимость"):
     * Оператор может вручную изменить курс, если нашел обменник с лучшим курсом,
     * постоянный клиент обменника дает льготы, или курс в TG боте устарел.
     * Это и есть настройка "изменить себестоимость" в UI.
     *
     * ПРИМЕР:
     * Есть 1,216 USDT, USD/EUR = 0.858588 (из XE), коэффициент Сербии = 0.922
     * Итоговый курс = 0.858588 × 0.922 = 0.7916, получим: 1,216 × 0.7916 = 962.79 EUR
     */
    const usdEurRate = resolveRate(snapshot.usd_variants.usd, 'Курс USD/EUR (XE)', issues);
    const tgCoefDefault = resolveRate(
        input.country === 'serbia'
            ? snapshot.tg.serbia.eur_usdt_coefficient
            : snapshot.tg.montenegro.eur_usdt_coefficient,
        `Коэффициент-множитель EUR/USDT (${input.country === 'serbia' ? 'Сербия' : 'Черногория'})`,
        issues,
    );
    assertNoIssues(issues);

    const tgRateDefault = usdEurRate! * tgCoefDefault!;
    const effectiveTgRate = input.customEurPerUsdt ?? tgRateDefault; // Используем кастомный курс если задан

    if (input.customEurPerUsdt && Math.abs(input.customEurPerUsdt - tgRateDefault) > 1e-9) {
        warnings.push('Использован пользовательский коэффициент-множитель EUR/USDT');
    }

    eurAmount = usdtAfterRapira * effectiveTgRate;
    addStep({
        label: 'USDT → EUR',
        amount: eurAmount,
        currency: 'EUR',
        rate: buildRateDescriptor(
            'EUR/USDT',
            effectiveTgRate,
            false,
            input.customEurPerUsdt ? 'Пользовательский коэффициент-множитель' : 'TG бот',
        ),
        formula: `${formatNumberWithSpaces(usdtAfterRapira, 6)} USDT × ${effectiveTgRate.toFixed(6)} = ${formatNumberWithSpaces(eurAmount)} EUR`,
        previousAmount: usdtAfterRapira,
        previousCurrency: 'USDT',
    });

    /**
     * ШАГ 7: Применяем коэффициент прибыли - это наша маржа
     *
     * КАК РАБОТАЕТ:
     *
     * 1. ОБЫЧНЫЙ РЕЖИМ (по таблице):
     *    - Есть таблица порогов, например:
     *      * до 5,000 EUR: коэффициент 0.95 (то есть наша прибыль 5%)
     *      * от 5,000 до 10,000 EUR: коэффициент 0.97 (прибыль 3%)
     *      * от 10,000 EUR: коэффициент 0.98 (прибыль 2%)
     *    - Чем больше сумма, тем меньше процент (оптовый подход)
     *    - Смотрим в какой порог попадает сумма и берем соответствующий коэффициент
     *
     * 2. РЕЖИМ "ПРОВЕРЕННЫЕ" (1%):
     *    - Если клиент проверенный, ставим фикс 1% независимо от суммы
     *    - Коэффициент = 0.99
     *    - Это льготный режим для постоянных клиентов
     *
     * 3. КАСТОМНЫЙ РЕЖИМ:
     *    - Оператор может вручную задать любой коэффициент
     *    - Например, для VIP клиента можно сделать 0.5% (коэффициент 0.995)
     *    - Или наоборот, для рискованной сделки поднять до 7% (коэффициент 0.93)
     *
     * ФОРМУЛА:
     * - итоговая_сумма = сумма × коэффициент
     * - Например: 10,000 EUR × 0.98 = 9,800 EUR (мы забрали 200 EUR прибыли)
     */
    marginTier = pickMarginTier(eurAmount, snapshot.business.margin_tiers);
    profitCoefficient = determineProfitCoefficient(input.profit, marginTier, issues);
    assertNoIssues(issues);

    if (input.profit.mode === 'custom') {
        warnings.push('Использован пользовательский коэффициент прибыли');
    }

    amountAfterMargin = eurAmount * profitCoefficient;
    const profitPercent = ((1 - profitCoefficient) * 100).toFixed(1);
    addStep({
        label: 'Применение прибыли',
        amount: amountAfterMargin,
        currency: 'EUR',
        rate: buildRateDescriptor('Коэффициент прибыли', profitCoefficient),
        note: profitCoefficient !== marginTier?.coefficient ? 'Изменённое значение' : undefined,
        formula: `${formatNumberWithSpaces(eurAmount)} EUR × ${profitCoefficient.toFixed(6)} = ${formatNumberWithSpaces(amountAfterMargin)} EUR (убрано ${profitPercent}%)`,
        previousAmount: eurAmount,
        previousCurrency: 'EUR',
    });

    /** Шаг 8: Конвертация в целевую валюту (если не EUR) */
    let outputAmount = amountAfterMargin;
    if (input.outputCurrency === 'RSD') {
        const rsdPerEur = snapshot.business.rsd_per_eur.value;
        if (!rsdPerEur) {
            issues.push('Не удалось получить курс RSD/EUR');
            return {
                inputAmount: amount,
                outputAmount: 0,
                eurBeforeMargin: eurAmount,
                amountAfterMargin,
                marginTier,
                profitCoefficient,
                steps,
                expenses: expensesInfo,
                employeeCommission: employeeCommissionInfo,
                warnings,
            };
        }
        outputAmount = amountAfterMargin * rsdPerEur;
        addStep({
            label: 'EUR → RSD',
            amount: outputAmount,
            currency: 'RSD',
            rate: buildRateDescriptor('Фиксированный курс RSD/EUR', rsdPerEur),
            formula: `${formatNumberWithSpaces(amountAfterMargin)} EUR × ${rsdPerEur.toFixed(4)} = ${formatNumberWithSpaces(outputAmount, 0)} RSD`,
            previousAmount: amountAfterMargin,
            previousCurrency: 'EUR',
        });
    }

    return {
        inputAmount: amount,
        outputAmount,
        eurBeforeMargin: eurAmount,
        amountAfterMargin,
        marginTier,
        profitCoefficient,
        steps,
        expenses: expensesInfo,
        employeeCommission: employeeCommissionInfo,
        warnings,
    };
}

interface PurchaseComputationOptions {
    input: PurchaseInput;
    snapshot: RatesSnapshot;
    amount: number;
    collectSteps: boolean;
}

interface PurchaseComputationResult {
    inputAmount: number;
    outputAmount: number;
    eurBeforeMargin: number;
    rubBeforeMargin: number;
    rubAfterMargin: number;
    marginTier: MarginTier | null;
    profitCoefficient: number;
    steps: CalculationStep[];
    expenses?: ExpensesInfo;
    employeeCommission?: EmployeeCommissionInfo;
    warnings: string[];
    rubPerEurCalc?: number | null;
}

/**
 * ПОКУПКА - когда клиент приносит нам EUR/RSD в Сербии/ЧГ, а мы ему выдаем RUB/EUR/USD в РФ
 *
 * КАК ЭТО РАБОТАЕТ:
 *
 * 1. Клиент дает нам, например, 10,000,000 RSD в Сербии
 * 2. Конвертируем в EUR (если дали RSD) - по фикс курсу
 * 3. За эти EUR покупаем USDT на месте (через TG бота)
 *    - Курс EUR/USDT берем из настройки "себестоимость" (можно менять вручную)
 *    - По умолчанию: 0.922 для Сербии, 0.99 для ЧГ
 * 4. Отправляем эти USDT в РФ
 * 5. В Rapira (обменник) продаем USDT за RUB
 *    - Rapira берет комиссию ~0.1%
 * 6. Если клиент хочет EUR/USD вместо RUB - несем в FinTech и меняем
 * 7. ВАЖНО: Вычитаем вознаграждение сотрудника в РФ
 *    - Опять же, вычитаем из-за лимита 2,111,513
 *    - Базовые 20 USD + комиссия по таблице
 * 8. Если регионы - вычитаем расходы курьера
 * 9. Применяем нашу прибыль (обычно 2-5%)
 * 10. Выдаем клиенту
 *
 * ПОЧЕМУ ИМЕННО ТАК:
 * - Обратный путь: из Сербии/ЧГ в РФ через USDT
 * - Себестоимость - это наш реальный курс покупки USDT за границей
 *   (может меняться в зависимости от обменника, поэтому даем настройку)
 * - Все остальное аналогично продаже, только в обратном порядке
 *
 * @param input - Что хочет клиент (валюты, суммы, место встречи)
 * @param snapshot - Текущие курсы всех обменников
 * @param amount - Сколько клиент дает нам в Сербии/ЧГ
 * @param collectSteps - Нужно ли сохранять подробные шаги для отчета
 * @returns Результат: сколько выдаем клиенту в РФ + все промежуточные шаги
 *
 * @throws {CalculatorError} Если нет курсов или сумма слишком маленькая
 */
function performPurchase({
    input,
    snapshot,
    amount,
    collectSteps,
}: PurchaseComputationOptions): PurchaseComputationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const steps: CalculationStep[] = [];

    if (collectSteps) {
        steps.push({
            label: 'Сумма на входе',
            amount,
            currency: input.inputCurrency,
        });
    }

    const minEmployeeRewardUsd = 100;
    const estimatedUsdRate = snapshot.fintech.usd_white?.buy?.value || snapshot.fintech.usd_blue?.buy?.value || 80;
    const minRequiredRub = minEmployeeRewardUsd * estimatedUsdRate;

    let estimatedInputEur = amount;
    if (input.inputCurrency === 'RSD') {
        const rsdPerEur = snapshot.business.rsd_per_eur.value || 117;
        estimatedInputEur = amount / rsdPerEur;
    }

    const usdEurRateEstimate = snapshot.usd_variants.usd?.value || 0.85;
    const tgCoefEstimate =
        input.country === 'serbia'
            ? snapshot.tg.serbia?.eur_usdt_coefficient?.value || 0.99
            : snapshot.tg.montenegro?.eur_usdt_coefficient?.value || 0.99;
    const estimatedUsdt = estimatedInputEur / (usdEurRateEstimate * tgCoefEstimate);
    const rapiraRateEstimate = snapshot.rapira?.value || 82;
    const rapiraMultiplierEstimate = snapshot.business.rapira_multiplier;
    const estimatedRub = estimatedUsdt * rapiraRateEstimate * rapiraMultiplierEstimate;

    if (collectSteps && estimatedRub < minRequiredRub) {
        warnings.push(
            `⚠️ Сумма может быть недостаточной. Минимальное вознаграждение сотрудника составляет около ${minRequiredRub.toFixed(0)} RUB (${minEmployeeRewardUsd} USD)`,
        );
    }

    const addStep = (step: CalculationStep) => {
        if (collectSteps) steps.push(step);
    };

    /** Шаг 1: Конвертация входной валюты в EUR */
    let eurAmount = amount;

    let rubAmount = 0;
    let outputAmount = 0;
    let amountAfterMargin = 0;
    let marginTier: MarginTier | null = null;
    let profitCoefficient = 1;

    if (input.inputCurrency === 'RSD') {
        const rsdPerEur = snapshot.business.rsd_per_eur.value;
        if (!rsdPerEur) {
            issues.push('Не удалось получить курс RSD/EUR');
            return {
                inputAmount: amount,
                outputAmount: 0,
                eurBeforeMargin: 0,
                rubBeforeMargin: 0,
                rubAfterMargin: 0,
                marginTier: null,
                profitCoefficient: 1,
                steps,
                expenses: undefined,
                warnings,
            };
        }
        eurAmount = amount / rsdPerEur;
        addStep({
            label: 'RSD → EUR',
            amount: eurAmount,
            currency: 'EUR',
            rate: buildRateDescriptor('Фиксированный курс RSD/EUR', rsdPerEur),
        });
    }

    /** Шаг 2: Конвертация EUR в USDT через TG бот */
    const tgCoefDefault = resolveRate(
        input.country === 'serbia'
            ? snapshot.tg.serbia.eur_usdt_coefficient
            : snapshot.tg.montenegro.eur_usdt_coefficient,
        `Коэффициент-множитель EUR/USDT (${input.country === 'serbia' ? 'Сербия' : 'Черногория'})`,
        issues,
    );

    const usdEurRate = resolveRate(snapshot.usd_variants.usd, 'Курс USD/EUR (XE)', issues);
    assertNoIssues(issues);

    const tgRateDefault = usdEurRate! * tgCoefDefault!;
    const effectiveEurPerUsdt = input.customEurPerUsdt ?? tgRateDefault;
    const usdtPerEur = 1 / effectiveEurPerUsdt;
    const usdtAmount = eurAmount * usdtPerEur;

    if (input.customEurPerUsdt && Math.abs(input.customEurPerUsdt - tgRateDefault) > 1e-9) {
        warnings.push('Использован пользовательский коэффициент-множитель EUR/USDT');
    }

    addStep({
        label: 'EUR → USDT',
        amount: usdtAmount,
        currency: 'USDT',
        rate: buildRateDescriptor(
            'USDT/EUR',
            usdtPerEur,
            false,
            input.customEurPerUsdt ? 'Пользовательский коэффициент-множитель' : 'TG бот',
        ),
    });

    /** Шаг 3: Конвертация USDT в RUB через Rapira */
    const rapiraRate = resolveRate(snapshot.rapira, 'Курс USDT/RUB (Rapira)', issues);
    assertNoIssues(issues);

    const rapiraMultiplier = snapshot.business.rapira_multiplier;
    rubAmount = usdtAmount * rapiraRate! * rapiraMultiplier;
    addStep({
        label: 'USDT → RUB (Rapira)',
        amount: rubAmount,
        currency: 'RUB',
        rate: buildRateDescriptor('Rapira курс', rapiraRate!, snapshot.rapira.override, 'Rapira'),
        note: `Комиссия платформы ${Math.round((1 - rapiraMultiplier) * 10000) / 100}%`,
    });

    /** Шаг 4: Рассчитываем вознаграждение сотрудника */
    const baseEmployeeRewardUsd = 20;
    const usdWhiteRate = getFintechRate(snapshot, 'usd_white', 'buy').value;
    const usdBlueRate = getFintechRate(snapshot, 'usd_blue', 'buy').value;
    const usdToRubRate = usdWhiteRate || usdBlueRate;
    if (!usdToRubRate) {
        issues.push('Не удалось получить курс USD/RUB для расчета вознаграждения сотрудника');
        return {
            inputAmount: amount,
            outputAmount: 0,
            eurBeforeMargin: eurAmount,
            rubBeforeMargin: rubAmount,
            rubAfterMargin: 0,
            marginTier: null,
            profitCoefficient: 1,
            steps,
            expenses: undefined,
            warnings,
        };
    }
    const baseEmployeeRewardRub = baseEmployeeRewardUsd * usdToRubRate;
    rubAmount -= baseEmployeeRewardRub;

    const additionalEmployeeRewardUsd = calculateEmployeeCommission(eurAmount, input.meetingPlace);
    const additionalEmployeeRewardRub = additionalEmployeeRewardUsd * usdToRubRate;
    rubAmount -= additionalEmployeeRewardRub;

    const totalEmployeeRewardUsd = baseEmployeeRewardUsd + additionalEmployeeRewardUsd;
    const totalEmployeeRewardRub = totalEmployeeRewardUsd * usdToRubRate;

    const employeeCommissionInfo: EmployeeCommissionInfo = {
        usd: totalEmployeeRewardUsd,
        rub: totalEmployeeRewardRub,
        eurEquivalent: eurAmount,
    };

    if (rubAmount < 0) {
        issues.push(
            `Сумма недостаточна для покрытия вознаграждения сотрудника (требуется минимум ${totalEmployeeRewardRub.toFixed(2)} RUB)`,
        );
        assertNoIssues(issues);
    }

    addStep({
        label: 'Вознаграждение сотрудника в РФ',
        amount: rubAmount,
        currency: 'RUB',
        note: `Вычтено ${totalEmployeeRewardUsd.toFixed(2)} USD (базовое 20 + комиссия ${additionalEmployeeRewardUsd}) × ${usdToRubRate.toFixed(2)} RUB/USD = ${totalEmployeeRewardRub.toFixed(2)} RUB`,
    });

    let rubPerEurCalc: number | null = null;

    /** Шаг 5: Конвертация RUB в целевую валюту через FinTech */
    if (input.outputCurrency === 'EUR') {
        const eurSellRate = resolveRate(
            getFintechRate(snapshot, 'eur', 'sell'),
            'FinTech продажа EUR (курс RUB/EUR)',
            issues,
        );
        assertNoIssues(issues);
        outputAmount = rubAmount / eurSellRate!;
        addStep({
            label: 'RUB → EUR (FinTech)',
            amount: outputAmount,
            currency: 'EUR',
            rate: buildRateDescriptor('FinTech продажа EUR', eurSellRate!, false, 'FinTech Exchange'),
        });
    } else if (input.outputCurrency === 'USD_WHITE') {
        const usdWhiteSellRate = resolveRate(
            getFintechRate(snapshot, 'usd_white', 'sell'),
            'FinTech продажа USD бел. (курс RUB/USD)',
            issues,
        );
        assertNoIssues(issues);
        outputAmount = rubAmount / usdWhiteSellRate!;
        addStep({
            label: 'RUB → USD бел. (FinTech)',
            amount: outputAmount,
            currency: 'USD_WHITE',
            rate: buildRateDescriptor('FinTech продажа USD бел.', usdWhiteSellRate!, false, 'FinTech Exchange'),
        });
    } else if (input.outputCurrency === 'USD_BLUE') {
        const usdBlueSellRate = resolveRate(
            getFintechRate(snapshot, 'usd_blue', 'sell'),
            'FinTech продажа USD син. (курс RUB/USD)',
            issues,
        );
        assertNoIssues(issues);
        outputAmount = rubAmount / usdBlueSellRate!;
        addStep({
            label: 'RUB → USD син. (FinTech)',
            amount: outputAmount,
            currency: 'USD_BLUE',
            rate: buildRateDescriptor('FinTech продажа USD син.', usdBlueSellRate!, false, 'FinTech Exchange'),
        });
    } else if (input.outputCurrency === 'RUB') {
        outputAmount = rubAmount;
    }

    /** Шаг 6: Применяем коэффициент прибыли */
    marginTier = pickMarginTier(eurAmount, snapshot.business.margin_tiers);
    profitCoefficient = determineProfitCoefficient(input.profit, marginTier, issues);
    assertNoIssues(issues);

    if (input.profit.mode === 'custom') {
        warnings.push('Использован пользовательский коэффициент прибыли');
    }

    amountAfterMargin = outputAmount * profitCoefficient;
    addStep({
        label: 'Применение прибыли',
        amount: amountAfterMargin,
        currency: input.outputCurrency,
        rate: buildRateDescriptor('Коэффициент прибыли', profitCoefficient),
        note: profitCoefficient !== marginTier?.coefficient ? 'Изменённое значение' : undefined,
    });

    /** Шаг 7: Вычитаем расходы курьера (только для региональных встреч) */
    let expensesInfo: ExpensesInfo | undefined;
    let finalAmount = amountAfterMargin;

    if (input.meetingPlace === 'regions' && input.expensesRub > 0) {
        if (input.outputCurrency === 'RUB') {
            finalAmount = Math.max(amountAfterMargin - input.expensesRub, 0);
            expensesInfo = {
                rub: input.expensesRub,
                converted: input.expensesRub,
                currency: 'RUB',
            };
        } else {
            const fintechRate =
                input.outputCurrency === 'EUR'
                    ? getFintechRate(snapshot, 'eur', 'sell')
                    : input.outputCurrency === 'USD_WHITE'
                      ? getFintechRate(snapshot, 'usd_white', 'sell')
                      : input.outputCurrency === 'USD_BLUE'
                        ? getFintechRate(snapshot, 'usd_blue', 'sell')
                        : null;
            const rubPerTargetCurrency = fintechRate
                ? resolveRate(fintechRate, `Курс RUB/${input.outputCurrency}`, issues)
                : null;
            if (rubPerTargetCurrency) {
                const expenseInTargetCurrency = input.expensesRub / rubPerTargetCurrency;
                finalAmount = Math.max(amountAfterMargin - expenseInTargetCurrency, 0);
                expensesInfo = {
                    rub: input.expensesRub,
                    converted: expenseInTargetCurrency,
                    currency: input.outputCurrency,
                };
            }
        }

        addStep({
            label: 'Расходы курьера (билеты/отель)',
            amount: finalAmount,
            currency: input.outputCurrency,
            note: `Вычтено ${input.expensesRub.toFixed(2)} RUB расходов`,
        });
    }

    outputAmount = finalAmount;
    assertNoIssues(issues);

    if (input.inputCurrency === 'EUR' && input.outputCurrency === 'RUB') {
        rubPerEurCalc = finalAmount / amount;
    }

    return {
        inputAmount: amount,
        outputAmount,
        eurBeforeMargin: eurAmount,
        rubBeforeMargin: rubAmount,
        rubAfterMargin: amountAfterMargin,
        marginTier,
        profitCoefficient,
        steps,
        expenses: expensesInfo,
        employeeCommission: employeeCommissionInfo,
        warnings,
        rubPerEurCalc,
    };
}

/**
 * РЕВЕРСИВНЫЙ РАСЧЕТ для продажи - когда клиент говорит "мне надо получить 100,000 EUR на выходе"
 *
 * ЗАЧЕМ ЭТО НУЖНО:
 * - Обычный расчет: клиент говорит "у меня есть 500,000 RUB", мы считаем сколько выдадим
 * - Реверсивный: клиент говорит "мне нужно получить 100,000 EUR", мы считаем сколько он должен принести
 *
 * ПОЧЕМУ СЛОЖНО:
 * - Мы не можем просто "развернуть формулу", потому что:
 *   1. Вознаграждение сотрудника зависит от объема сделки (есть таблица с порогами)
 *   2. Коэффициент прибыли тоже зависит от объема
 *   3. Все эти вещи нелинейные - от суммы зависит процент
 *
 * КАК РАБОТАЕТ:
 * - Делаем "умную угадайку" (итеративный алгоритм)
 * - Берем начальное предположение = целевая сумма
 * - Запускаем обычный расчет с этим предположением
 * - Смотрим что получилось на выходе
 * - Корректируем предположение: если мало - увеличиваем, если много - уменьшаем
 * - Повторяем 20 раз, обычно за 5-7 итераций находим точный ответ
 *
 * ПРИМЕР:
 * - Нужно: 100,000 EUR
 * - Итерация 1: пробуем 100,000 RUB → получилось 85,000 EUR (мало)
 * - Итерация 2: пробуем 118,000 RUB → получилось 101,000 EUR (много)
 * - Итерация 3: пробуем 117,200 RUB → получилось 99,950 EUR (почти)
 * - И так далее, пока не попадем в ~100,000 EUR
 *
 * @param input - Что хочет клиент (валюты, место встречи и тд)
 * @param snapshot - Текущие курсы
 * @param targetAmount - Сколько клиент хочет получить на выходе
 * @returns Результат: сколько клиент должен принести + подробные шаги
 *
 * @throws {CalculatorError} Если не можем найти решение за 20 итераций
 */
function solveReverseSale(input: SaleInput, snapshot: RatesSnapshot, targetAmount: number): SaleComputationResult {
    let guess = Math.max(targetAmount, 1);
    for (let i = 0; i < 20; i++) {
        const sim = performSale({
            input,
            snapshot,
            amount: guess,
            collectSteps: false,
        });
        if (sim.outputAmount <= 0) {
            throw new CalculatorError(['Не удалось выполнить обратный расчёт продажи']);
        }
        const ratio = targetAmount / sim.outputAmount;
        const nextGuess = guess * ratio;
        if (!Number.isFinite(nextGuess) || nextGuess <= 0) {
            throw new CalculatorError(['Не удалось выполнить обратный расчёт продажи']);
        }
        if (Math.abs(nextGuess - guess) / guess < 1e-6) {
            guess = nextGuess;
            break;
        }
        guess = nextGuess;
    }
    return performSale({ input, snapshot, amount: guess, collectSteps: true });
}

/**
 * Выполняет реверсивный расчет операции покупки (от целевой суммы к входной)
 *
 * Использует итеративный алгоритм для нахождения входной суммы,
 * которая даст желаемую выходную сумму после всех комиссий и конвертаций.
 *
 * @param input - Входные данные для операции покупки
 * @param snapshot - Снимок курсов валют
 * @param targetAmount - Желаемая выходная сумма
 * @returns Результат расчета с входной суммой и шагами
 *
 * @throws {CalculatorError} Если не удается выполнить обратный расчет
 */
function solveReversePurchase(
    input: PurchaseInput,
    snapshot: RatesSnapshot,
    targetAmount: number,
): PurchaseComputationResult {
    let guess = Math.max(targetAmount, 1);
    for (let i = 0; i < 20; i++) {
        const sim = performPurchase({
            input,
            snapshot,
            amount: guess,
            collectSteps: false,
        });
        if (sim.outputAmount <= 0) {
            throw new CalculatorError(['Не удалось выполнить обратный расчёт покупки']);
        }
        const ratio = targetAmount / sim.outputAmount;
        const nextGuess = guess * ratio;
        if (!Number.isFinite(nextGuess) || nextGuess <= 0) {
            throw new CalculatorError(['Не удалось выполнить обратный расчёт покупки']);
        }
        if (Math.abs(nextGuess - guess) / guess < 1e-6) {
            guess = nextGuess;
            break;
        }
        guess = nextGuess;
    }
    return performPurchase({
        input,
        snapshot,
        amount: guess,
        collectSteps: true,
    });
}

/**
 * Основная функция расчета валютных операций (продажа/покупка)
 *
 * Выполняет полный расчет с учетом:
 * - Конвертации валют по актуальным курсам
 * - Комиссий платформ (Rapira, FinTech)
 * - Вознаграждения сотрудника по таблице Дениса
 * - Расходов курьера (для региональных встреч)
 * - Коэффициентов прибыли
 * - Реверсивного расчета (от целевой суммы к входной)
 *
 * @param input - Входные данные для расчета (сценарий, валюты, суммы, настройки)
 * @param snapshot - Снимок актуальных курсов валют и коэффициентов
 * @returns Полный результат расчета с шагами, суммами и метаданными
 *
 * @throws {CalculatorError} Если отсутствуют необходимые курсы или некорректные данные
 *
 * @example
 * ```typescript
 * const input: SaleInput = {
 *   scenario: 'sale',
 *   country: 'serbia',
 *   meetingPlace: 'msk_office',
 *   inputCurrency: 'RUB',
 *   outputCurrency: 'EUR',
 *   amount: 100000,
 *   profit: { mode: 'tier' }
 * };
 *
 * const result = calculate(input, ratesSnapshot);
 * console.log(result.outputAmount); // 847.46 EUR
 * ```
 */
export function calculate(input: CalculatorInput, snapshot: RatesSnapshot): CalculationResult {
    const fintechTimestamp = snapshot.fintech.timestamp ?? null;
    const cbrRubPerEur = snapshot.cbr.rub_per_eur.value ?? null;

    if (input.scenario === 'sale') {
        const baseInput = input;
        const computation = baseInput.reverseMode
            ? (() => {
                  if (baseInput.targetAmount == null || baseInput.targetAmount <= 0) {
                      throw new CalculatorError(['Для обратного расчёта необходимо указать сумму к выдаче']);
                  }
                  return solveReverseSale(baseInput, snapshot, baseInput.targetAmount);
              })()
            : performSale({
                  input: baseInput,
                  snapshot,
                  amount: baseInput.amount,
                  collectSteps: true,
              });

        if (!(baseInput.inputCurrency === 'EUR' && baseInput.outputCurrency === 'EUR')) {
            switch (baseInput.inputCurrency) {
                case 'RUB': {
                    const cbrRubPerEur = snapshot.cbr.rub_per_eur.value;
                    if (cbrRubPerEur == null) {
                        throw new CalculatorError(['Не удалось получить курс RUB/EUR']);
                    }
                    break;
                }
                case 'USD_WHITE':
                case 'USD_BLUE': {
                    const xeUsdToEur = snapshot.usd_variants.usd.value;
                    if (xeUsdToEur == null) {
                        throw new CalculatorError(['Не удалось получить курс USD/EUR']);
                    }
                    break;
                }
                case 'EUR':
                default:
                    break;
            }
        }

        return {
            scenario: 'sale',
            country: baseInput.country,
            meetingPlace: baseInput.meetingPlace,
            inputCurrency: baseInput.inputCurrency,
            inputAmount: computation.inputAmount,
            outputCurrency: baseInput.outputCurrency,
            outputAmount: computation.outputAmount,
            targetAmount: baseInput.reverseMode ? baseInput.targetAmount : undefined,
            steps: computation.steps,
            commission: { channel: 'office', tier: null, usd: null, eur: null },
            expenses: computation.expenses,
            employeeCommission: computation.employeeCommission,
            profitCoefficient: computation.profitCoefficient,
            profitMode: baseInput.profit.mode,
            marginTier: computation.marginTier,
            margin: {
                baseAmount: computation.eurBeforeMargin,
                baseCurrency: 'EUR',
                afterAmount: computation.amountAfterMargin,
                afterCurrency: 'EUR',
            },
            warnings: computation.warnings,
            fintechTimestamp,
            rubPerEurCalc: null,
            cbrRubPerEur,
        };
    }

    const baseInput = input;
    const computation = baseInput.reverseMode
        ? (() => {
              if (baseInput.targetAmount == null || baseInput.targetAmount <= 0) {
                  throw new CalculatorError(['Для обратного расчёта необходимо указать сумму к выдаче']);
              }
              return solveReversePurchase(baseInput, snapshot, baseInput.targetAmount);
          })()
        : performPurchase({
              input: baseInput,
              snapshot,
              amount: baseInput.amount,
              collectSteps: true,
          });

    return {
        scenario: 'purchase',
        country: baseInput.country,
        meetingPlace: baseInput.meetingPlace,
        inputCurrency: baseInput.inputCurrency,
        inputAmount: computation.inputAmount,
        outputCurrency: baseInput.outputCurrency,
        outputAmount: computation.outputAmount,
        targetAmount: baseInput.reverseMode ? baseInput.targetAmount : undefined,
        steps: computation.steps,
        commission: { channel: 'office', tier: null, usd: null, eur: null },
        expenses: computation.expenses,
        employeeCommission: computation.employeeCommission,
        profitCoefficient: computation.profitCoefficient,
        profitMode: baseInput.profit.mode,
        marginTier: computation.marginTier,
        margin: {
            baseAmount: computation.rubBeforeMargin,
            baseCurrency: 'RUB',
            afterAmount: computation.rubAfterMargin,
            afterCurrency: 'RUB',
        },
        warnings: computation.warnings,
        fintechTimestamp,
        rubPerEurCalc: computation.rubPerEurCalc ?? null,
        cbrRubPerEur,
    };
}
