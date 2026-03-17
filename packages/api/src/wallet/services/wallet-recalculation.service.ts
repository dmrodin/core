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

    public async getCalculatedWalletAmount(
        tx: Prisma.TransactionClient,
        walletId: string,
        excludeOperationId?: string,
    ): Promise<number> {
        return this.calculateWalletAmount(tx, walletId, excludeOperationId);
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

    private async calculateWalletAmount(
        tx: Prisma.TransactionClient,
        walletId: string,
        excludeOperationId?: string,
    ): Promise<number> {
        const groupedAmounts = await tx.operationEntry.groupBy({
            by: ['direction'],
            where: {
                walletId,
                deleted: false,
                operation: { deleted: false },
                ...(excludeOperationId && { operationId: { not: excludeOperationId } }),
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

    private async updateBeforeAfterForWallets(tx: Prisma.TransactionClient, walletIds: string[]): Promise<void> {
        for (const walletId of walletIds) {
            await this.updateBeforeAfterForWallet(tx, walletId);
        }
    }

    private async updateBeforeAfterForWallet(tx: Prisma.TransactionClient, walletId: string): Promise<void> {
        const entries = await tx.operationEntry.findMany({
            where: {
                walletId,
                deleted: false,
                operation: { deleted: false },
            },
            orderBy: [{ operation: { createdAt: 'asc' } }, { createdAt: 'asc' }, { id: 'asc' }],
            select: {
                id: true,
                direction: true,
                amount: true,
            },
        });

        let runningBalance = 0;

        for (const entry of entries) {
            const before = runningBalance;
            const after =
                entry.direction === OperationDirection.credit
                    ? runningBalance + entry.amount
                    : runningBalance - entry.amount;

            await tx.operationEntry.update({
                where: { id: entry.id },
                data: {
                    before,
                    after,
                },
            });

            runningBalance = after;
        }
    }
}
