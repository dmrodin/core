import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { UpdateWalletDto } from '../dto';
import { UpdateWalletOutput } from '../types';

@Injectable()
export class UpdateWalletUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        walletId: string,
        updateWalletDto: UpdateWalletDto,
        updatedById: string,
    ): Promise<UpdateWalletOutput> {
        const {
            name,
            description,
            amount,
            balanceStatus,
            walletKind,
            walletTypeId,
            currencyId,
            secondUserId,
            active,
            pinOnMain,
            pinned,
            visible,
            deleted,
            monthlyLimit,
        } = updateWalletDto;

        const existingWallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
        });

        if (!existingWallet || existingWallet.deleted) {
            throw new NotFoundException('Кошелек не найден');
        }

        const wallet = await this.prisma.wallet.update({
            where: { id: walletId },
            data: {
                updatedById,
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(amount !== undefined && { amount }),
                ...(balanceStatus !== undefined && { balanceStatus }),
                ...(walletKind !== undefined && { walletKind }),
                ...(walletTypeId !== undefined && { walletTypeId }),
                ...(currencyId !== undefined && { currencyId }),
                ...(secondUserId !== undefined && { secondUserId }),
                ...(active !== undefined && { active }),
                ...(pinOnMain !== undefined && { pinOnMain }),
                ...(pinned !== undefined && { pinned }),
                ...(visible !== undefined && { visible }),
                ...(deleted !== undefined && { deleted }),
                ...(monthlyLimit !== undefined && { monthlyLimit }),
                ...(updateWalletDto.details && {
                    details: {
                        update: {
                            ...updateWalletDto.details,
                        },
                    },
                }),
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
                        platform: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                        bank: {
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
            message: 'Кошелек успешно обновлен',
            wallet,
        };
    }
}
