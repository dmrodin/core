import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { Workbook } from 'exceljs';

import { OperationDirection, Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { GetConversionWalletsReportDto } from '../dto';
import {
    ConversionReportOperation,
    ConversionReportRow,
    ConversionWalletEntry,
    ReportFile,
    WalletLookupEntry,
} from '../types';

@Injectable()
export class GenerateConversionWalletsReportUseCase {
    private static readonly SECTION_ALL = 'all';
    private static readonly SECTION_HIDDEN = 'hidden';

    constructor(private readonly prisma: PrismaService) {}

    public async execute(dto: GetConversionWalletsReportDto): Promise<ReportFile> {
        const sections = this.resolveSections(dto.sections);
        const hasAllSection = sections.includes(GenerateConversionWalletsReportUseCase.SECTION_ALL);
        const walletIds = hasAllSection ? null : await this.getWalletIdsBySections(sections);

        const operations = (await this.prisma.operation.findMany({
            where: {
                deleted: false,
                type: { code: OPERATION_TYPE_CODES.CONVERSION },
                ...(walletIds !== null && {
                    entries: {
                        some: {
                            walletId: { in: walletIds },
                            deleted: false,
                        },
                    },
                }),
                ...(dto.dateStart || dto.dateEnd
                    ? {
                          createdAt: {
                              ...(dto.dateStart ? { gte: dto.dateStart } : {}),
                              ...(dto.dateEnd
                                  ? {
                                        lte: new Date(
                                            new Date(dto.dateEnd).setUTCHours(23, 59, 59, 999),
                                        ),
                                    }
                                  : {}),
                          },
                      }
                    : {}),
            },
            orderBy: [{ createdAt: 'asc' }, { conversionGroupId: 'asc' }],
            include: {
                entries: {
                    where: { deleted: false },
                    select: {
                        id: true,
                        walletId: true,
                        direction: true,
                        amount: true,
                    },
                },
                type: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                created_by: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        })) as ConversionReportOperation[];

        const walletMap = await this.buildWalletMap(operations);
        const rows = this.buildRows(operations, walletMap);

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('conversion');

        worksheet.columns = [
            { header: 'Номер', key: 'number', width: 10 },
            { header: 'Дата', key: 'date', width: 22 },
            { header: 'Тип операции', key: 'operationType', width: 24 },
            { header: 'Автор', key: 'author', width: 18 },
            { header: 'Комментарий', key: 'comment', width: 32 },
            { header: 'Источник', key: 'source', width: 28 },
            { header: 'Сумма', key: 'amount', width: 14 },
            { header: 'Курс', key: 'exchangeRate', width: 12 },
            { header: 'Валюта', key: 'currency', width: 12 },
        ];

        rows.forEach((row) => worksheet.addRow(row));

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

        return {
            buffer,
            filename: `conversion-wallets-report-${timestamp}.xlsx`,
        };
    }

    private resolveSections(inputSections?: string[]): string[] {
        const normalized = (inputSections ?? [GenerateConversionWalletsReportUseCase.SECTION_ALL])
            .map((section) => section.trim().toLowerCase())
            .filter(Boolean);

        if (normalized.length === 0) {
            return [GenerateConversionWalletsReportUseCase.SECTION_ALL];
        }

        return Array.from(new Set(normalized));
    }

    private async getWalletIdsBySections(sections: string[]): Promise<string[]> {
        const hasAllSection = sections.includes(GenerateConversionWalletsReportUseCase.SECTION_ALL);
        const hasHiddenSection = hasAllSection || sections.includes(GenerateConversionWalletsReportUseCase.SECTION_HIDDEN);
        const walletTypeCodes = hasAllSection
            ? []
            : sections.filter(
                  (section) =>
                      section !== GenerateConversionWalletsReportUseCase.SECTION_ALL &&
                      section !== GenerateConversionWalletsReportUseCase.SECTION_HIDDEN,
              );

        const where: Prisma.WalletWhereInput = { deleted: false };

        if (!hasAllSection) {
            const orConditions: Prisma.WalletWhereInput[] = [];

            if (hasHiddenSection) {
                orConditions.push({ visible: false });
            }

            if (walletTypeCodes.length > 0) {
                orConditions.push({
                    visible: true,
                    walletType: { code: { in: walletTypeCodes } },
                });
            }

            if (orConditions.length === 0) {
                return [];
            }

            where.OR = orConditions;
        }

        const wallets = await this.prisma.wallet.findMany({
            where,
            select: { id: true },
        });

        return wallets.map((w) => w.id);
    }

    private async buildWalletMap(operations: ConversionReportOperation[]): Promise<Map<string, WalletLookupEntry>> {
        const walletIds = new Set<string>();

        operations.forEach((operation) => {
            operation.entries.forEach((entry) => walletIds.add(entry.walletId));
        });

        if (walletIds.size === 0) {
            return new Map();
        }

        const wallets: { id: string; name: string; currency: { code: string } }[] = await this.prisma.wallet.findMany({
            where: { id: { in: Array.from(walletIds) } },
            select: {
                id: true,
                name: true,
                currency: { select: { code: true } },
            },
        });

        const walletMap = new Map<string, WalletLookupEntry>();

        wallets.forEach((wallet) => {
            walletMap.set(wallet.id, {
                id: wallet.id,
                name: wallet.name,
                walletType: null,
                currencyCode: wallet.currency.code,
            });
        });

        return walletMap;
    }

    private buildRows(
        operations: ConversionReportOperation[],
        walletMap: Map<string, WalletLookupEntry>,
    ): Array<Omit<ConversionReportRow, 'number' | 'amount'> & { number: number | string; amount: number }> {
        const rows: Array<Omit<ConversionReportRow, 'number' | 'amount'> & { number: number | string; amount: number }> = [];
        const grouped = new Map<number, ConversionReportOperation[]>();
        const ungrouped: ConversionReportOperation[] = [];

        operations.forEach((operation) => {
            if (operation.conversionGroupId === null) {
                ungrouped.push(operation);
                return;
            }

            const group = grouped.get(operation.conversionGroupId) ?? [];

            group.push(operation);
            grouped.set(operation.conversionGroupId, group);
        });

        const sortedGroupIds = Array.from(grouped.keys()).sort((a, b) => a - b);

        sortedGroupIds.forEach((groupId) => {
            const groupOperations = grouped.get(groupId)!;
            const sortedOperations = groupOperations.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id),
            );

            sortedOperations.forEach((operation) => {
                this.pushOperationRows(rows, operation, walletMap, groupId);
            });
        });

        const sortedUngrouped = ungrouped.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id),
        );

        sortedUngrouped.forEach((operation) => {
            this.pushOperationRows(rows, operation, walletMap, '');
        });

        return rows;
    }

    private pushOperationRows(
        rows: Array<Omit<ConversionReportRow, 'number' | 'amount'> & { number: number | string; amount: number }>,
        operation: ConversionReportOperation,
        walletMap: Map<string, WalletLookupEntry>,
        number: number | string,
    ): void {
        const baseRow = {
            number,
            date: format(operation.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            operationType: operation.type?.name ?? 'Неизвестно',
            author: operation.created_by?.username ?? 'Неизвестно',
            comment: operation.description ?? '',
        };

        const creditEntries = this.collectEntries(operation, walletMap, OperationDirection.credit);
        const debitEntries = this.collectEntries(operation, walletMap, OperationDirection.debit);

        if (creditEntries.length === 0 && debitEntries.length === 0) return;

        const { normalizedCredits, normalizedDebits } = this.normalizeEntries(creditEntries, debitEntries);
        const length = Math.max(normalizedCredits.length, normalizedDebits.length);

        for (let index = 0; index < length; index += 1) {
            const credit = normalizedCredits[index];
            const debit = normalizedDebits[index];
            const exchangeRate = this.calculateExchangeRate(credit, debit);

            if (credit) {
                rows.push({ ...baseRow, source: credit.name, amount: credit.amount, exchangeRate, currency: credit.currency });
            }

            if (debit) {
                rows.push({ ...baseRow, source: debit.name, amount: -debit.amount, exchangeRate, currency: debit.currency });
            }
        }
    }

    private collectEntries(
        operation: ConversionReportOperation,
        walletMap: Map<string, WalletLookupEntry>,
        direction: OperationDirection,
    ): ConversionWalletEntry[] {
        return operation.entries
            .filter((entry) => entry.direction === direction)
            .map((entry) => {
                const wallet = walletMap.get(entry.walletId);

                return {
                    name: wallet?.name ?? 'Неизвестный кошелек',
                    amount: entry.amount,
                    currency: wallet?.currencyCode ?? '',
                };
            });
    }

    private normalizeEntries(credits: ConversionWalletEntry[], debits: ConversionWalletEntry[]) {
        if (credits.length === debits.length) {
            return { normalizedCredits: credits, normalizedDebits: debits };
        }

        if (credits.length === 0 || debits.length === 0) {
            return { normalizedCredits: credits, normalizedDebits: debits };
        }

        if (credits.length < debits.length) {
            return { normalizedCredits: credits, normalizedDebits: this.mergeEntries(debits, credits.length) };
        }

        return { normalizedCredits: this.mergeEntries(credits, debits.length), normalizedDebits: debits };
    }

    private mergeEntries(entries: ConversionWalletEntry[], targetLength: number): ConversionWalletEntry[] {
        if (entries.length <= targetLength || targetLength <= 0) return entries;

        const merged = entries.slice(0, targetLength);
        const mergeIndex = targetLength - 1;
        const base = merged[mergeIndex];
        let totalAmount = base.amount;

        for (let index = targetLength; index < entries.length; index += 1) {
            totalAmount += entries[index].amount;
        }

        merged[mergeIndex] = { ...base, amount: totalAmount };

        return merged;
    }

    private calculateExchangeRate(credit?: ConversionWalletEntry, debit?: ConversionWalletEntry): number {
        const creditAmount = credit?.amount ?? 0;
        const debitAmount = debit?.amount ?? 0;

        if (creditAmount === 0 || debitAmount === 0) return 1;

        const larger = Math.max(creditAmount, debitAmount);
        const smaller = Math.min(creditAmount, debitAmount);

        return Number((larger / smaller).toFixed(6));
    }
}
