import { BadRequestException, Injectable } from '@nestjs/common';

import { BalanceStatus } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { WalletRecalculationService } from '../../wallet/services';
import { CreateOperationDto } from '../dto';
import { CreateOperationResponse } from '../types';

@Injectable()
export class CreateOperationUseCase {
    private static readonly INSKESH_WALLET_TYPE_CODE = 'inskech';

    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

    public async execute(createOperationDto: CreateOperationDto, userId: string): Promise<CreateOperationResponse> {
        const { typeId, description, conversionGroupId, entries, applicationId, creatureDate, banksGroupId } =
            createOperationDto;

        return this.prisma.$transaction(async (tx) => {
            const operationDate = new Date(creatureDate);

            if (Number.isNaN(operationDate.getTime())) {
                throw new BadRequestException('Дата операции должна быть валидной датой');
            }

            const operationDateOnly = new Date(
                Date.UTC(operationDate.getUTCFullYear(), operationDate.getUTCMonth(), operationDate.getUTCDate()),
            );

            const lockedPeriod = await tx.lockedPeriod.findFirst({
                where: {
                    isActive: true,
                    dateFrom: { lte: operationDateOnly },
                    dateTo: { gte: operationDateOnly },
                },
                select: {
                    dateFrom: true,
                    dateTo: true,
                },
            });

            if (lockedPeriod) {
                const formatDate = (value: Date) =>
                    value.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: 'UTC',
                    });

                throw new BadRequestException(
                    `Создание операций запрещено в период ${formatDate(lockedPeriod.dateFrom)} - ${formatDate(
                        lockedPeriod.dateTo,
                    )}`,
                );
            }

            const operationType = await tx.operationType.findUnique({
                where: { id: typeId },
                select: { code: true },
            });

            if (operationType?.code === OPERATION_TYPE_CODES.CONVERSION) {
                const walletIds = Array.from(new Set(entries.map((entry) => entry.walletId)));
                const walletsForConversionRule = await tx.wallet.findMany({
                    where: { id: { in: walletIds } },
                    select: {
                        id: true,
                        walletType: {
                            select: {
                                code: true,
                            },
                        },
                    },
                });

                const walletTypeCodeByWalletId = new Map(
                    walletsForConversionRule.map((wallet) => [wallet.id, wallet.walletType?.code ?? null]),
                );

                const areAllWalletsInskesh =
                    walletIds.length > 0 &&
                    walletIds.every(
                        (walletId) =>
                            walletTypeCodeByWalletId.get(walletId) ===
                            CreateOperationUseCase.INSKESH_WALLET_TYPE_CODE,
                    );

                if (areAllWalletsInskesh && !conversionGroupId) {
                    throw new BadRequestException(
                        'Для операции "Конвертация" необходимо указать номер конвертации (conversionGroupId)',
                    );
                }
            }

            // Валидация и обработка длятипа "Корректировка"
            if (operationType?.code === OPERATION_TYPE_CODES.CORRECTION) {
                if (entries.length !== 1) {
                    throw new BadRequestException(
                        'Операция "Корректировка" должна содержать ровно одну запись (один кошелек)',
                    );
                }

                const entry = entries[0];
                const currentBalance = await this.walletRecalculationService.getCalculatedWalletAmount(
                    tx,
                    entry.walletId,
                );
                const desiredBalance = entry.amount;
                const difference = desiredBalance - currentBalance;

                if (difference > 0) {
                    entry.amount = difference;
                    entry.direction = 'credit';
                } else if (difference < 0) {
                    entry.amount = Math.abs(difference);
                    entry.direction = 'debit';
                } else {
                    throw new BadRequestException(
                        'Баланс кошелька уже равен указанному значению. Корректировка не требуется.',
                    );
                }
            }

            for (const entry of entries) {
                const wallet = await tx.wallet.findUnique({
                    where: { id: entry.walletId },
                    select: {
                        id: true,
                        name: true,
                        monthlyLimit: true,
                        balanceStatus: true,
                        currency: {
                            select: {
                                code: true,
                            },
                        },
                    },
                });

                if (!wallet) {
                    throw new BadRequestException(`Кошелек с ID ${entry.walletId} не найден`);
                }

                if (entry.direction === 'credit' && wallet.monthlyLimit && wallet.monthlyLimit > 0) {
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

                    const monthlyEntries = await tx.operationEntry.findMany({
                        where: {
                            walletId: entry.walletId,
                            deleted: false,
                            createdAt: {
                                gte: startOfMonth,
                                lt: endOfMonth,
                            },
                        },
                        select: {
                            amount: true,
                        },
                    });

                    const currentSpent = monthlyEntries.reduce((sum, e) => sum + e.amount, 0);
                    const remaining = wallet.monthlyLimit - currentSpent;

                    if (entry.amount > remaining) {
                        throw new BadRequestException(
                            `Превышен месячный лимит кошелька "${wallet.name}". ` +
                                `Доступно: ${remaining.toLocaleString('ru-RU')} ${wallet.currency.code}, ` +
                                `требуется: ${entry.amount.toLocaleString('ru-RU')} ${wallet.currency.code}`,
                        );
                    }
                }

                if (wallet.balanceStatus === BalanceStatus.positive) {
                    await tx.wallet.update({
                        where: { id: wallet.id },
                        data: {
                            balanceStatus: BalanceStatus.unknown,
                            lastReconciledAt: null,
                            lastReconciledBy: null,
                        },
                    });
                }
            }

            const operation = await tx.operation.create({
                data: {
                    userId,
                    updatedById: userId,
                    typeId,
                    ...(applicationId && { applicationId }),
                    description,
                    conversionGroupId,
                    createdAt: creatureDate,
                    banksGroupId,
                },
            });

            for (const entry of entries) {
                await tx.operationEntry.create({
                    data: {
                        userId,
                        updatedById: userId,
                        operationId: operation.id,
                        walletId: entry.walletId,
                        direction: entry.direction,
                        amount: entry.amount,
                    },
                });
            }

            await this.walletRecalculationService.recalculateForOperation(tx, operation.id, userId);

            if (applicationId) {
                const appId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;

                await tx.application.update({
                    where: { id: appId },
                    data: {
                        operationId: operation.id,
                        updatedById: userId,
                    },
                });
            }

            const createdOperation = await tx.operation.findUnique({
                where: { id: operation.id },
                include: {
                    entries: {
                        where: { deleted: false },
                        select: {
                            id: true,
                            walletId: true,
                            direction: true,
                            amount: true,
                            before: true,
                            after: true,
                            userId: true,
                            updatedById: true,
                            createdAt: true,
                            updatedAt: true,
                            wallet: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    type: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
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
                },
            });

            const { deleted: _, ...operationResponse } = createdOperation!;

            return {
                message: 'Операция успешно создана',
                operation: {
                    ...operationResponse,
                    type: addOperationTypeFlags(operationResponse.type),
                },
            };
        });
    }
}
