import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { Workbook } from 'exceljs';

import { OperationDirection, Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { GetOperationsWalletsReportDto } from '../dto';
import { GeneralReportRow, OperationsReportOperation, ReportFile, WalletLookupEntry } from '../types';

@Injectable()
export class GenerateOperationsWalletsReportUseCase {
    private static readonly SECTION_ALL = 'all';
    private static readonly SECTION_HIDDEN = 'hidden';

    constructor(private readonly prisma: PrismaService) {}

    public async execute(dto: GetOperationsWalletsReportDto): Promise<ReportFile> {
        const sections = this.resolveSections(dto.sections);
        const hasAllSection = sections.includes(GenerateOperationsWalletsReportUseCase.SECTION_ALL);
        const walletIds = hasAllSection ? null : await this.getWalletIdsBySections(sections);

        const operations = await this.prisma.operation.findMany({
            where: {
                deleted: false,
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
                                        lte: new Date(new Date(dto.dateEnd).setUTCHours(23, 59, 59, 999)),
                                    }
                                  : {}),
                          },
                      }
                    : {}),
            },
            orderBy: { createdAt: 'asc' },
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
                application: {
                    where: { deleted: false },
                    select: {
                        id: true,
                    },
                },
            },
        });

        const walletMap = await this.buildWalletMap(operations as OperationsReportOperation[]);
        const rows = this.buildRows(operations as OperationsReportOperation[], walletMap, walletIds);

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('operations');

        worksheet.columns = [
            { header: 'Номер', key: 'number', width: 10 },
            { header: 'Дата', key: 'date', width: 22 },
            { header: 'Тип операции', key: 'operationType', width: 24 },
            { header: 'Автор', key: 'author', width: 18 },
            { header: 'Комментарий', key: 'comment', width: 32 },
            { header: 'Источник', key: 'source', width: 28 },
            { header: 'Сумма', key: 'amount', width: 14 },
            { header: 'Валюта', key: 'currency', width: 12 },
            { header: 'Номер заявки', key: 'applicationNumber', width: 16 },
        ];

        rows.forEach((row) => worksheet.addRow(row));

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

        return {
            buffer,
            filename: `operations-wallets-report-${timestamp}.xlsx`,
        };
    }

    private resolveSections(inputSections?: string[]): string[] {
        const normalized = (inputSections ?? [GenerateOperationsWalletsReportUseCase.SECTION_ALL])
            .map((section) => section.trim().toLowerCase())
            .filter(Boolean);

        if (normalized.length === 0) {
            return [GenerateOperationsWalletsReportUseCase.SECTION_ALL];
        }

        return Array.from(new Set(normalized));
    }

    private async getWalletIdsBySections(sections: string[]): Promise<string[]> {
        const hasAllSection = sections.includes(GenerateOperationsWalletsReportUseCase.SECTION_ALL);
        const hasHiddenSection =
            hasAllSection || sections.includes(GenerateOperationsWalletsReportUseCase.SECTION_HIDDEN);
        const walletTypeCodes = hasAllSection
            ? []
            : sections.filter(
                  (section) =>
                      section !== GenerateOperationsWalletsReportUseCase.SECTION_ALL &&
                      section !== GenerateOperationsWalletsReportUseCase.SECTION_HIDDEN,
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

    private async buildWalletMap(operations: OperationsReportOperation[]): Promise<Map<string, WalletLookupEntry>> {
        const walletIds = new Set<string>();

        operations.forEach((operation) => {
            operation.entries.forEach((entry) => walletIds.add(entry.walletId));
        });

        if (walletIds.size === 0) {
            return new Map();
        }

        const wallets: {
            id: string;
            name: string;
            walletType: { code: string } | null;
            currency: { code: string };
        }[] = await this.prisma.wallet.findMany({
            where: { id: { in: Array.from(walletIds) } },
            select: {
                id: true,
                name: true,
                walletType: { select: { code: true } },
                currency: { select: { code: true } },
            },
        });

        const walletMap = new Map<string, WalletLookupEntry>();

        wallets.forEach((wallet) => {
            walletMap.set(wallet.id, {
                id: wallet.id,
                name: wallet.name,
                walletType: wallet.walletType,
                currencyCode: wallet.currency.code,
            });
        });

        return walletMap;
    }

    private buildRows(
        operations: OperationsReportOperation[],
        walletMap: Map<string, WalletLookupEntry>,
        filterWalletIds: string[] | null,
    ): Array<Omit<GeneralReportRow, 'amount'> & { amount: number }> {
        const rows: Array<Omit<GeneralReportRow, 'amount'> & { amount: number }> = [];
        const filterSet = filterWalletIds !== null ? new Set(filterWalletIds) : null;
        let sequence = 0;

        operations.forEach((operation) => {
            const entries = operation.entries.filter((entry) => filterSet === null || filterSet.has(entry.walletId));

            if (entries.length === 0) {
                return;
            }

            sequence += 1;

            const baseRow = {
                number: sequence,
                date: format(operation.createdAt, 'yyyy-MM-dd HH:mm:ss'),
                operationType: operation.type?.name ?? 'Неизвестно',
                author: operation.created_by?.username ?? 'Неизвестно',
                comment: operation.description ?? '',
                applicationNumber: this.resolveApplicationNumber(operation),
            };

            entries.forEach((entry) => {
                const wallet = walletMap.get(entry.walletId);
                const sign = entry.direction === OperationDirection.credit ? 1 : -1;

                rows.push({
                    ...baseRow,
                    source: wallet?.name ?? 'Неизвестный кошелек',
                    amount: sign * entry.amount,
                    currency: wallet?.currencyCode ?? '',
                });
            });
        });

        return rows;
    }

    private resolveApplicationNumber(operation: OperationsReportOperation): string {
        if (!operation.application) {
            return '';
        }

        return String(operation.application.id);
    }
}
