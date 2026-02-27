import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';

export interface GetWalletMonthlyLimitOutput {
    message: string;
    limit: number | null;
    spent: number;
    remaining: number | null;
    currencyCode: string;
}

@Injectable()
export class GetWalletMonthlyLimitUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(walletId: string): Promise<GetWalletMonthlyLimitOutput> {
        // Получаем кошелек с валютой
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                currency: true,
            },
        });

        if (!wallet) {
            throw new NotFoundException('Кошелек не найден');
        }

        // Определяем границы текущего месяца
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Получаем все операции за текущий месяц для данного кошелька
        const entries = await this.prisma.operationEntry.findMany({
            where: {
                walletId,
                deleted: false,
                direction: 'credit',
                createdAt: {
                    gte: startOfMonth,
                    lt: endOfMonth,
                },
            },
        });

        // Суммируем все операции (и входящие, и исходящие)
        const spent = entries.reduce((sum, entry) => sum + entry.amount, 0);

        // Вычисляем остаток
        const remaining = wallet.monthlyLimit !== null ? wallet.monthlyLimit - spent : null;

        return {
            message: 'Месячный лимит успешно получен',
            limit: wallet.monthlyLimit,
            spent,
            remaining,
            currencyCode: wallet.currency.code,
        };
    }
}
