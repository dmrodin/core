import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { ChangeWalletOwnerDto } from '../dto/requests/change-wallet-owner.dto';
import { ChangeWalletOwnerOutput } from '../types';

@Injectable()
export class ChangeWalletOwnerUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        walletId: string,
        changeWalletOwnerDto: ChangeWalletOwnerDto,
        updatedById: string,
    ): Promise<ChangeWalletOwnerOutput> {
        const { newOwnerId } = changeWalletOwnerDto;

        const existingWallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                secondUser: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        if (!existingWallet || existingWallet.deleted) {
            throw new NotFoundException('Кошелек не найден');
        }

        const newOwner = await this.prisma.user.findUnique({
            where: { id: newOwnerId },
        });

        if (!newOwner || newOwner.deleted) {
            throw new NotFoundException('Пользователь не найден');
        }

        if (!newOwner.isHolder) {
            throw new BadRequestException('Выбранный пользователь не является держателем');
        }

        if (existingWallet.userId === newOwnerId) {
            throw new BadRequestException('Указанный пользователь уже является держателем этого кошелька');
        }

        const wallet = await this.prisma.wallet.update({
            where: { id: walletId },
            data: {
                userId: newOwnerId,
                updatedById,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                secondUser: {
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

        const fastAccessPin = await this.prisma.walletFastAccessPin.findUnique({
            where: { userId_walletId: { userId: updatedById, walletId } },
            select: { id: true },
        });

        return {
            message: 'Держатель кошелька успешно изменен',
            wallet: { ...wallet, isFastAccessByCurrentUser: Boolean(fastAccessPin) },
        };
    }
}
