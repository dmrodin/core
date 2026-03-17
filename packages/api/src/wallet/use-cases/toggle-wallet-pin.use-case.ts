import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { ToggleWalletPinDto } from '../dto/requests/toggle-wallet-pin.dto';
import { UpdateWalletOutput } from '../types';

@Injectable()
export class ToggleWalletPinUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        walletId: string,
        toggleWalletPinDto: ToggleWalletPinDto,
        updatedById: string,
    ): Promise<UpdateWalletOutput> {
        const { pinned, pinOnMain } = toggleWalletPinDto;

        const existingWallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
        });

        if (!existingWallet || existingWallet.deleted) {
            throw new NotFoundException('Кошелек не найден');
        }

        const wallet = await this.prisma.wallet.update({
            where: { id: walletId },
            data: {
                pinned,
                pinOnMain,
                updatedById,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                created_by: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                updated_by: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                lastReconciled_by: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                currency: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
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
                        network: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                        networkType: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            message: 'Настройки закрепления кошелька обновлены',
            wallet,
        };
    }
}
