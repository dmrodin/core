import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { WalletRecalculationService } from '../../wallet/services/wallet-recalculation.service';
import { UpdateOperationDto } from '../dto';
import { UpdateOperationResponse } from '../types';

@Injectable()
export class UpdateOperationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

    public async execute(
        operationId: string,
        updateOperationDto: UpdateOperationDto,
        updatedById: string,
    ): Promise<UpdateOperationResponse> {
        const existingOperation = await this.prisma.operation.findUnique({
            where: { id: operationId },
            select: {
                id: true,
                typeId: true,
                applicationId: true,
                deleted: true,
                entries: {
                    where: { deleted: false },
                    select: {
                        id: true,
                        walletId: true,
                        direction: true,
                        amount: true,
                    },
                },
                type: {
                    select: {
                        id: true,
                        code: true,
                    },
                },
            },
        });

        if (!existingOperation || existingOperation.deleted) {
            throw new NotFoundException('Операция не найдена');
        }

        return await this.prisma.$transaction(async (tx) => {
            const { typeId, description, conversionGroupId, entries, creatureDate, applicationId } = updateOperationDto;

            // Получаем тип операции для проверки специальной логики
            let operationType: { code: string } | null = null;

            if (typeId) {
                operationType = await tx.operationType.findUnique({
                    where: { id: typeId },
                    select: { code: true },
                });
            }

            // Валидация и обработка для типа "Корректировка"
            if (operationType && operationType.code === OPERATION_TYPE_CODES.CORRECTION && entries) {
                if (entries.length !== 1) {
                    throw new BadRequestException(
                        'Операция "Корректировка" должна содержать ровно одну запись (один кошелек)',
                    );
                }

                // Для корректировки: amount - это желаемый баланс, нужно вычислить разницу
                const entry = entries[0];
                const currentBalance = await this.walletRecalculationService.getCalculatedWalletAmount(
                    tx,
                    entry.walletId,
                );
                const desiredBalance = entry.amount;
                const difference = desiredBalance - currentBalance;

                // Обновляем amount на разницу и устанавливаем правильное направление
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

            // Проверяем смену типа операции с "Аванс" на другой
            let shouldCompleteApplication = false;

            if (typeId && typeId !== existingOperation.typeId) {
                // Получаем новый тип операции
                const newType = await tx.operationType.findUnique({
                    where: { id: typeId },
                    select: { code: true },
                });

                // Если старый тип был "Аванс", а новый - нет, то нужно завершить заявку
                if (
                    existingOperation.type.code === OPERATION_TYPE_CODES.AVANS &&
                    newType?.code !== OPERATION_TYPE_CODES.AVANS
                ) {
                    shouldCompleteApplication = true;
                }
            }

            await tx.operation.update({
                where: { id: operationId },
                data: {
                    updatedById,
                    ...(typeId !== undefined && { typeId }),
                    ...(description !== undefined && { description }),
                    ...(conversionGroupId !== undefined && { conversionGroupId }),
                    ...(creatureDate !== undefined && { createdAt: creatureDate }),
                    ...(applicationId !== undefined && { applicationId }),
                },
            });

            // Если изменился applicationId, обновляем operationId в заявке
            if (applicationId !== undefined && applicationId !== null) {
                // Сначала очищаем operationId у старой заявки (если была)
                if (existingOperation.applicationId) {
                    await tx.application.updateMany({
                        where: {
                            id: existingOperation.applicationId,
                            deleted: false,
                        },
                        data: {
                            operationId: null,
                            updatedById,
                        },
                    });
                }

                // Устанавливаем operationId у новой заявки
                await tx.application.update({
                    where: { id: applicationId },
                    data: {
                        operationId,
                        updatedById,
                    },
                });
            }

            // Если нужно завершить заявку, связанную с этой операцией
            if (shouldCompleteApplication) {
                await tx.application.updateMany({
                    where: {
                        operationId,
                        deleted: false,
                    },
                    data: {
                        status: 'done',
                        updatedById,
                    },
                });
            }

            if (entries) {
                const existingEntries = existingOperation.entries;
                const incomingEntryIds = new Set(entries.map((entry) => entry.id).filter((id): id is string => !!id));
                const entriesToDelete = existingEntries.filter((entry) => !incomingEntryIds.has(entry.id));

                for (const entry of entriesToDelete) {
                    await tx.operationEntry.update({
                        where: { id: entry.id },
                        data: {
                            deleted: true,
                            updatedById,
                        },
                    });
                }

                // Проверка месячных лимитов для всех изменяемых/новых записей
                for (const entry of entries) {
                    const wallet = await tx.wallet.findUnique({
                        where: { id: entry.walletId },
                        select: {
                            id: true,
                            name: true,
                            monthlyLimit: true,
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

                    // Если у кошелька установлен месячный лимит, проверяем его
                    if (entry.direction === 'credit' && wallet.monthlyLimit && wallet.monthlyLimit > 0) {
                        // Определяем границы текущего месяца
                        const now = new Date();
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

                        // Получаем сумму всех операций за текущий месяц (кроме текущей редактируемой записи)
                        const monthlyEntries = await tx.operationEntry.findMany({
                            where: {
                                walletId: entry.walletId,
                                deleted: false,
                                direction: 'credit',
                                createdAt: {
                                    gte: startOfMonth,
                                    lt: endOfMonth,
                                },
                                // Исключаем текущую редактируемую запись, если она существует
                                ...(entry.id && { id: { not: entry.id } }),
                            },
                            select: {
                                amount: true,
                            },
                        });

                        const currentSpent = monthlyEntries.reduce((sum, e) => sum + e.amount, 0);
                        const remaining = wallet.monthlyLimit - currentSpent;

                        // Проверяем, не превысит ли измененная/новая операция лимит
                        if (entry.amount > remaining) {
                            throw new BadRequestException(
                                `Превышен месячный лимит кошелька "${wallet.name}". ` +
                                    `Доступно: ${remaining.toLocaleString('ru-RU')} ${wallet.currency.code}, ` +
                                    `требуется: ${entry.amount.toLocaleString('ru-RU')} ${wallet.currency.code}`,
                            );
                        }
                    }
                }

                for (const entry of entries) {
                    if (entry.id) {
                        const existingEntry = existingEntries.find((item) => item.id === entry.id);

                        if (!existingEntry) {
                            throw new NotFoundException(`Запись операции с ID ${entry.id} не найдена`);
                        }

                        await tx.operationEntry.update({
                            where: { id: entry.id },
                            data: {
                                updatedById,
                                walletId: entry.walletId,
                                direction: entry.direction,
                                amount: entry.amount,
                            },
                        });
                    } else {
                        await tx.operationEntry.create({
                            data: {
                                userId: updatedById,
                                updatedById,
                                operationId,
                                walletId: entry.walletId,
                                direction: entry.direction,
                                amount: entry.amount,
                            },
                        });
                    }
                }

                await this.walletRecalculationService.recalculateForOperation(tx, operationId, updatedById);
            }

            const updatedOperation = await tx.operation.findUnique({
                where: { id: operationId },
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

            const { deleted: _, ...operationResponse } = updatedOperation!;

            return {
                message: 'Операция успешно обновлена',
                operation: {
                    ...operationResponse,
                    type: addOperationTypeFlags(operationResponse.type),
                },
            };
        });
    }
}
