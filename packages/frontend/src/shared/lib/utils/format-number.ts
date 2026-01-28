/**
 * Форматирует число с пробелами в качестве разделителя тысяч
 * @param value - число для форматирования
 * @returns отформатированная строка
 * @example formatNumber(1000000) => "1 000 000"
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('ru-RU').replace(/,/g, ' ');
};

/**
 * Парсит строку с числом, удаляя пробелы и другие нечисловые символы
 * @param value - строка для парсинга
 * @returns число или NaN если парсинг не удался
 * @example parseFormattedNumber("1 000 000") => 1000000
 */
export const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/\s/g, '');
    return parseInt(cleaned, 10);
};
