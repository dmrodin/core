import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { Workbook } from 'exceljs';

import { OperationDirection, Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { GetBalancesReportDto } from '../dto';
import { ClosingPeriodRow, ReportFile } from '../types';

@Injectable()
export class GenerateBalancesReportUseCase {
    private static readonly SECTION_ALL = 'all';
    private static readonly SECTION_HIDDEN = 'hidden';

    constructor(private readonly prisma: PrismaService) {}

    public async execute(dto: GetBalancesReportDto): Promise<ReportFile> {
        const sections = this.resolveSections(dto.sections);
        const wallets = await this.getWalletsBySections(sections);
        const balancesByWalletId = await this.getBalancesByWalletIds(
            wallets.map((wallet) => wallet.id),
            dto.snapshotAt,
        );

        const rows: ClosingPeriodRow[] = wallets.map((wallet) => ({
            name: wallet.name,
            currency: wallet.currency.code,
            balance: balancesByWalletId.get(wallet.id) ?? 0,
        }));

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('balances');

        worksheet.columns = [
            { header: 'Название кошелька', key: 'name', width: 32 },
            { header: 'Валюта', key: 'currency', width: 12 },
            { header: 'Баланс', key: 'balance', width: 18 },
        ];

        rows.forEach((row) => worksheet.addRow(row));

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

        return {
            buffer,
            filename: `balances-report-${timestamp}.xlsx`,
        };
    }

    private resolveSections(inputSections?: string[]): string[] {
        const normalized = (inputSections ?? [GenerateBalancesReportUseCase.SECTION_ALL])
            .map((section) => section.trim().toLowerCase())
            .filter(Boolean);

        if (normalized.length === 0) {
            return [GenerateBalancesReportUseCase.SECTION_ALL];
        }

        return Array.from(new Set(normalized));
    }

    private async getWalletsBySections(
        sections: string[],
    ): Promise<Array<{ id: string; name: string; currency: { code: string } }>> {
        const hasAllSection = sections.includes(GenerateBalancesReportUseCase.SECTION_ALL);
        const hasHiddenSection = hasAllSection || sections.includes(GenerateBalancesReportUseCase.SECTION_HIDDEN);
        const walletTypeCodes = hasAllSection
            ? []
            : sections.filter(
                  (section) =>
                      section !== GenerateBalancesReportUseCase.SECTION_ALL &&
                      section !== GenerateBalancesReportUseCase.SECTION_HIDDEN,
              );

        const where: Prisma.WalletWhereInput = {
            deleted: false,
        };

        if (!hasAllSection) {
            const orConditions: Prisma.WalletWhereInput[] = [];

            if (hasHiddenSection) {
                orConditions.push({ visible: false });
            }

            if (walletTypeCodes.length > 0) {
                orConditions.push({
                    visible: true,
                    walletType: {
                        code: {
                            in: walletTypeCodes,
                        },
                    },
                });
            }

            if (orConditions.length === 0) {
                return [];
            }

            where.OR = orConditions;
        }

        return this.prisma.wallet.findMany({
            where,
            select: {
                id: true,
                name: true,
                currency: {
                    select: {
                        code: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    private async getBalancesByWalletIds(walletIds: string[], snapshotAt: Date): Promise<Map<string, number>> {
        if (walletIds.length === 0) {
            return new Map();
        }

        const groupedEntries = await this.prisma.operationEntry.groupBy({
            by: ['walletId', 'direction'],
            where: {
                walletId: {
                    in: walletIds,
                },
                deleted: false,
                operation: {
                    deleted: false,
                    createdAt: {
                        lte: snapshotAt,
                    },
                },
            },
            _sum: {
                amount: true,
            },
        });

        const balancesByWalletId = new Map<string, number>();

        groupedEntries.forEach((entry) => {
            const current = balancesByWalletId.get(entry.walletId) ?? 0;
            const amount = entry._sum.amount ?? 0;

            if (entry.direction === OperationDirection.credit) {
                balancesByWalletId.set(entry.walletId, current + amount);

                return;
            }

            balancesByWalletId.set(entry.walletId, current - amount);
        });

        return balancesByWalletId;
    }
}
