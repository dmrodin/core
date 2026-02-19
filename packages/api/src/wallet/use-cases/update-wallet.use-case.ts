import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WalletKind } from 'prisma/generated/prisma';

import { PrismaService } from '../../common/services/prisma.service';
import { TelegramService } from '../../feedback/telegram.service';
import { TelegramBotType } from '../../feedback/types/telegram-bot.types';
import { UpdateWalletDto } from '../dto';
import { UpdateWalletOutput } from '../types';

@Injectable()
export class UpdateWalletUseCase {
    private readonly logger = new Logger(UpdateWalletUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly telegramService: TelegramService,
    ) {}

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
            include: {
                details: {
                    select: {
                        address: true,
                        phone: true,
                        card: true,
                        ownerFullName: true,
                        bankId: true,
                    },
                },
            },
        });

        if (!existingWallet || existingWallet.deleted) {
            throw new NotFoundException('Кошелек не найден');
        }

        const nextWalletKind = walletKind ?? existingWallet.walletKind;
        const incomingDetails = updateWalletDto.details;

        const isCryptoAddressChanged =
            nextWalletKind === WalletKind.crypto &&
            incomingDetails?.address !== undefined &&
            (incomingDetails.address ?? null) !== (existingWallet.details?.address ?? null);

        const isCardBankRequisitesChanged =
            nextWalletKind === WalletKind.bank &&
            Boolean(
                incomingDetails &&
                    ((incomingDetails.card !== undefined &&
                        (incomingDetails.card ?? null) !== (existingWallet.details?.card ?? null)) ||
                        (incomingDetails.ownerFullName !== undefined &&
                            (incomingDetails.ownerFullName ?? null) !==
                                (existingWallet.details?.ownerFullName ?? null)) ||
                        (incomingDetails.phone !== undefined &&
                            (incomingDetails.phone ?? null) !== (existingWallet.details?.phone ?? null)) ||
                        (incomingDetails.bankId !== undefined &&
                            (incomingDetails.bankId ?? null) !== (existingWallet.details?.bankId ?? null))),
            );

        const wallet = await this.prisma.wallet.update({
            where: { id: walletId },
            data: {
                updatedById,
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(amount !== undefined && { amount }),
                ...(balanceStatus !== undefined && {
                    balanceStatus,
                    lastReconciledAt: new Date(),
                    lastReconciledBy: updatedById,
                }),
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

        if (isCryptoAddressChanged || isCardBankRequisitesChanged) {
            const changeLabels: string[] = [];

            if (isCryptoAddressChanged) {
                changeLabels.push('изменен адрес криптокошелька');
            }
            if (isCardBankRequisitesChanged) {
                changeLabels.push('изменены реквизиты банка у карты');
            }

            const message = [
                '🔔 <b>Изменение реквизитов кошелька</b>',
                '',
                `<b>Кошелек:</b> ${wallet.name}`,
                `<b>ID:</b> <code>${wallet.id}</code>`,
                `<b>Тип:</b> ${wallet.walletKind}`,
                `<b>Изменения:</b> ${changeLabels.join(', ')}`,
                `<b>Кем изменено:</b> ${wallet.updated_by?.username ?? updatedById}`,
                `<b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
            ].join('\n');

            try {
                await this.telegramService.sendMessage(TelegramBotType.FEEDBACK, message);
            } catch {
                this.logger.warn(`Не удалось отправить Telegram-уведомление об изменении кошелька ${wallet.id}`);
            }
        }

        return {
            message: 'Кошелек успешно обновлен',
            wallet,
        };
    }
}
