import { Injectable } from '@nestjs/common';

import { BalanceStatus, OperationDirection, Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class WalletRecalculationService {
    constructor(private readonly prisma: PrismaService) {}

    public async recalculateForOperation(
        tx: Prisma.TransactionClient,
        operationId: string,
        updatedById?: string,
    ): Promise<void> {
        const walletIds = await this.getOperationWalletIds(tx, operationId);

        if (walletIds.length === 0) {
            return;
        }

        await this.recalculateWallets(tx, walletIds, updatedById);
        await this.updateBeforeAfterForWallets(tx, walletIds);
    }

    public async recalculateWallet(
        tx: Prisma.TransactionClient,
        walletId: string,
        updatedById?: string,
    ): Promise<void> {
        await this.recalculateWallets(tx, [walletId], updatedById);
        await this.updateBeforeAfterForWallets(tx, [walletId]);
    }

    public async recalculateForWallets(
        tx: Prisma.TransactionClient,
        walletIds: string[],
        updatedById?: string,
    ): Promise<void> {
        const uniqueIds = [...new Set(walletIds)];

        if (uniqueIds.length === 0) {
            return;
        }

        await this.recalculateWallets(tx, uniqueIds, updatedById);
        await this.updateBeforeAfterForWallets(tx, uniqueIds);
    }

    public async recalculateWallets(
        tx: Prisma.TransactionClient,
        walletIds: string[],
        updatedById?: string,
    ): Promise<void> {
        const uniqueIds = [...new Set(walletIds)];

        for (const walletId of uniqueIds) {
            const amount = await this.calculateWalletAmount(tx, walletId);
            // const balanceStatus = this.determineBalanceStatus(amount);

            await tx.wallet.update({
                where: { id: walletId },
                data: {
                    amount,
                    // balanceStatus,
                    ...(updatedById && { updatedById }),
                },
            });
        }
    }

    public async recalculateAllWallets(): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const wallets = await tx.wallet.findMany({
                where: { deleted: false },
                select: { id: true },
            });

            if (wallets.length === 0) {
                return;
            }

            const walletIds = wallets.map((wallet) => wallet.id);

            await this.recalculateWallets(tx, walletIds);
            await this.updateBeforeAfterForWallets(tx, walletIds);
        });
    }

    public async getCalculatedWalletAmount(tx: Prisma.TransactionClient, walletId: string): Promise<number> {
        return this.calculateWalletAmount(tx, walletId);
    }

    private async getOperationWalletIds(tx: Prisma.TransactionClient, operationId: string): Promise<string[]> {
        const entries = await tx.operationEntry.findMany({
            where: {
                operationId,
                deleted: false,
            },
            select: { walletId: true },
        });

        return entries.map((entry) => entry.walletId);
    }

    private async calculateWalletAmount(tx: Prisma.TransactionClient, walletId: string): Promise<number> {
        const groupedAmounts = await tx.operationEntry.groupBy({
            by: ['direction'],
            where: {
                walletId,
                deleted: false,
                operation: { deleted: false },
            },
            _sum: {
                amount: true,
            },
        });

        let balance = 0;

        for (const result of groupedAmounts) {
            const sum = result._sum.amount ?? 0;

            if (result.direction === OperationDirection.credit) {
                balance += sum;
            } else {
                balance -= sum;
            }
        }

        return balance;
    }

    private determineBalanceStatus(amount: number): BalanceStatus {
        if (amount > 0) {
            return BalanceStatus.positive;
        }

        if (amount < 0) {
            return BalanceStatus.negative;
        }

        return BalanceStatus.neutral;
    }

    // Пересчитывает before/after по всей цепочке записей кошелька одним запросом.
    // Обновляются только строки, у которых значения реально изменились.
    private async updateBeforeAfterForWallets(tx: Prisma.TransactionClient, walletIds: string[]): Promise<void> {
        if (walletIds.length === 0) {
            return;
        }

        await tx.$executeRaw`
            UPDATE "operation_entries" AS e
            SET "before" = s.running - s.signed,
                "after"  = s.running
            FROM (
                SELECT e.id,
                       CASE WHEN e.direction = 'credit' THEN e.amount ELSE -e.amount END AS signed,
                       SUM(CASE WHEN e.direction = 'credit' THEN e.amount ELSE -e.amount END)
                           OVER (
                               PARTITION BY e.wallet_id
                               ORDER BY o.created_at, e.created_at, e.id
                           ) AS running
                FROM "operation_entries" e
                JOIN "operations" o ON o.id = e.operation_id
                WHERE e.wallet_id = ANY(${walletIds}::uuid[])
                  AND e.deleted = false
                  AND o.deleted = false
            ) s
            WHERE e.id = s.id
              AND (e."before" IS DISTINCT FROM s.running - s.signed
                   OR e."after" IS DISTINCT FROM s.running)
        `;
    }
}
