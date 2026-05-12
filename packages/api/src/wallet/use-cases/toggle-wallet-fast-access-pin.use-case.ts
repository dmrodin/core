import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { ToggleWalletFastAccessPinDto } from '../dto/requests/toggle-wallet-fast-access-pin.dto';
import { UpdateWalletOutput } from '../types';

@Injectable()
export class ToggleWalletFastAccessPinUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        walletId: string,
        toggleDto: ToggleWalletFastAccessPinDto,
        currentUserId: string,
    ): Promise<UpdateWalletOutput> {
        const { pinned } = toggleDto;

        const existingWallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
        });

        if (!existingWallet || existingWallet.deleted) {
            throw new NotFoundException('Кошелек не найден');
        }

        if (pinned) {
            await this.prisma.walletFastAccessPin.upsert({
                where: { userId_walletId: { userId: currentUserId, walletId } },
                create: { userId: currentUserId, walletId },
                update: {},
            });
        } else {
            await this.prisma.walletFastAccessPin.deleteMany({
                where: { userId: currentUserId, walletId },
            });
        }

        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                user: { select: { id: true, username: true } },
                secondUser: { select: { id: true, username: true } },
                created_by: { select: { id: true, username: true } },
                updated_by: { select: { id: true, username: true } },
                lastReconciled_by: { select: { id: true, username: true } },
                currency: { select: { id: true, name: true, code: true } },
                walletType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        showInTabs: true,
                        tabOrder: true,
                    },
                },
                details: {
                    select: {
                        id: true,
                        phone: true,
                        card: true,
                        ownerFullName: true,
                        address: true,
                        accountId: true,
                        username: true,
                        exchangeUid: true,
                        network: { select: { id: true, code: true, name: true } },
                        networkType: { select: { id: true, code: true, name: true } },
                    },
                },
            },
        });

        if (!wallet) {
            throw new NotFoundException('Кошелек не найден');
        }

        return {
            message: pinned ? 'Кошелек добавлен в ваш быстрый доступ' : 'Кошелек убран из вашего быстрого доступа',
            wallet: { ...wallet, isFastAccessByCurrentUser: pinned },
        };
    }
}
