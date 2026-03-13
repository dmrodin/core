import { BadRequestException, Injectable } from '@nestjs/common';

import { BalanceStatus } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { WalletRecalculationService } from '../../wallet/services';
import {
    AVAILABLE_EXPENSE_CATEGORIES,
    EXPENSE_OPERATION_TYPE_CODE,
    ExpenseCategory,
} from '../constants/expense.constants';
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
        const {
            typeId,
            description,
            expenseCategory,
            conversionGroupId,
            entries,
            applicationId,
            creatureDate,
            banksGroupId,
        } = createOperationDto;

        return this.prisma.$transaction(async (tx) => {
            const appId = applicationId
                ? typeof applicationId === 'string'
                    ? parseInt(applicationId, 10)
                    : applicationId
                : null;
            const application = appId
                ? await tx.application.findUnique({
                      where: { id: appId },
                      select: { telegramUsername: true, phone: true },
                  })
                : null;
            const baseDescription = (description ?? '').trim();
            const descriptionLines = baseDescription ? [baseDescription] : [];

            if (application?.telegramUsername && !baseDescription.includes(application.telegramUsername)) {
                descriptionLines.push(`Telegram: ${application.telegramUsername}`);
            }

            if (application?.phone && !baseDescription.includes(application.phone)) {
                descriptionLines.push(`Телефон: ${application.phone}`);
            }

            const finalDescription = descriptionLines.length ? descriptionLines.join('\n') : null;

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
                select: { code: true, isDebit: true, isCredit: true },
            });

            const normalizedExpenseCategory = expenseCategory ?? null;
            let normalizedEntries = entries;

            const isDebitAllowed = operationType?.isDebit ?? false;
            const isCreditAllowed = operationType?.isCredit ?? false;
            const isSingleSide =
                operationType?.code !== OPERATION_TYPE_CODES.CORRECTION && isDebitAllowed !== isCreditAllowed;

            if (isSingleSide) {
                const allowedDirection = isDebitAllowed ? 'debit' : 'credit';
                const allowedEntries = entries.filter((entry) => entry.direction === allowedDirection);

                normalizedEntries =
                    allowedEntries.length > 0
                        ? allowedEntries
                        : entries.map((entry) => ({
                              ...entry,
                              direction: allowedDirection,
                          }));
            }

            if (operationType?.code === EXPENSE_OPERATION_TYPE_CODE) {
                if (!normalizedExpenseCategory) {
                    throw new BadRequestException('Для операции типа "expense" необходимо выбрать статью расхода');
                }

                if (!AVAILABLE_EXPENSE_CATEGORIES.includes(normalizedExpenseCategory as ExpenseCategory)) {
                    throw new BadRequestException(
                        `Некорректная статья расхода. Доступные значения: ${AVAILABLE_EXPENSE_CATEGORIES.join(', ')}`,
                    );
                }
            } else if (normalizedExpenseCategory) {
                throw new BadRequestException('Статья расхода доступна только для операции типа "expense"');
            }

            if (operationType?.code === OPERATION_TYPE_CODES.CONVERSION) {
                const walletIds = Array.from(new Set(normalizedEntries.map((entry) => entry.walletId)));
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
                            walletTypeCodeByWalletId.get(walletId) === CreateOperationUseCase.INSKESH_WALLET_TYPE_CODE,
                    );

                if (areAllWalletsInskesh && !conversionGroupId) {
                    throw new BadRequestException(
                        'Для операции "Конвертация" необходимо указать номер конвертации (conversionGroupId)',
                    );
                }
            }

            // Валидация и обработка длятипа "Корректировка"
            if (operationType?.code === OPERATION_TYPE_CODES.CORRECTION) {
                if (normalizedEntries.length !== 1) {
                    throw new BadRequestException(
                        'Операция "Корректировка" должна содержать ровно одну запись (один кошелек)',
                    );
                }

                const entry = normalizedEntries[0];
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

            for (const entry of normalizedEntries) {
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
                            direction: 'credit',
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
                    description: finalDescription,
                    expenseCategory: normalizedExpenseCategory,
                    conversionGroupId,
                    createdAt: creatureDate,
                    banksGroupId,
                },
            });

            for (const entry of normalizedEntries) {
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

            if (appId) {
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
