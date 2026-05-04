import { Injectable } from '@nestjs/common';
import { WalletKind } from 'prisma/generated/prisma';

import { PrismaService } from '../../common/services/prisma.service';
import { OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { CreateWalletDto } from '../dto';
import { WalletRecalculationService } from '../services';
import { CreateWalletOutput } from '../types';

@Injectable()
export class CreateWalletUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

    public async execute(createWalletDto: CreateWalletDto, userId: string): Promise<CreateWalletOutput> {
        const {
            name,
            description,
            amount,
            balanceStatus,
            walletKind = WalletKind.simple,
            walletTypeId,
            currencyId,
            secondUserId,
            active = true,
            pinOnMain = false,
            pinned = false,
            visible = true,
            monthlyLimit,
            details,
        } = createWalletDto;

        const hasDetails = Boolean(
            details && Object.values(details).some((value) => value !== undefined && value !== null && value !== ''),
        );

        const wallet = await this.prisma.$transaction(async (tx) => {
            const createdWallet = await tx.wallet.create({
                data: {
                    userId,
                    ...(secondUserId && { secondUserId }),
                    updatedById: userId,
                    name,
                    description,
                    amount,
                    balanceStatus: balanceStatus ?? 'unknown',
                    walletKind,
                    ...(walletTypeId && { walletTypeId }),
                    currencyId,
                    active,
                    pinOnMain,
                    pinned,
                    visible,
                    ...(monthlyLimit !== undefined && { monthlyLimit }),
                    ...(hasDetails && {
                        details: {
                            create: {
                                userId,
                                updatedById: userId,
                                phone: details?.phone ?? null,
                                card: details?.card ?? null,
                                ownerFullName: details?.ownerFullName ?? null,
                                address: details?.address ?? null,
                                accountId: details?.accountId ?? null,
                                username: details?.username ?? null,
                                exchangeUid: details?.exchangeUid ?? null,
                                networkId: details?.networkId ?? null,
                                networkTypeId: details?.networkTypeId ?? null,
                                platformId: details?.platformId ?? null,
                                bankId: details?.bankId ?? null,
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

            if (amount !== 0) {
                const correctionType = await tx.operationType.upsert({
                    where: { code: OPERATION_TYPE_CODES.CORRECTION },
                    create: {
                        code: OPERATION_TYPE_CODES.CORRECTION,
                        name: 'Корректировка',
                        description: 'Корректировка баланса кошелька',
                        isSeparateTab: false,
                        userId,
                        updatedById: userId,
                    },
                    update: {
                        deleted: false,
                        active: true,
                        isSeparateTab: false,
                        updatedById: userId,
                    },
                    select: { id: true },
                });

                const direction = amount > 0 ? 'credit' : 'debit';
                const adjustmentAmount = Math.abs(amount);

                const operation = await tx.operation.create({
                    data: {
                        userId,
                        updatedById: userId,
                        typeId: correctionType.id,
                        description: `Начальный баланс кошелька "${createdWallet.name}"`,
                    },
                });

                await tx.operationEntry.create({
                    data: {
                        userId,
                        updatedById: userId,
                        operationId: operation.id,
                        walletId: createdWallet.id,
                        direction,
                        amount: adjustmentAmount,
                    },
                });

                await this.walletRecalculationService.recalculateForOperation(tx, operation.id, userId);
            }

            return createdWallet;
        });

        return {
            message: 'Кошелек успешно создан',
            wallet: { ...wallet, isPinnedByCurrentUser: false },
        };
    }
}
