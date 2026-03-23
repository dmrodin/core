import { Injectable, NotFoundException } from '@nestjs/common';

import { OperationDirection } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common';
import { addOperationTypeFlags } from '../../operation-type/constants/operation-type.constants';
import { WalletRecalculationService } from '../../wallet/services';
import { AdjustmentOperationDto } from '../dto';
import { AdjustmentOperationResponse } from '../types';

@Injectable()
export class AdjustmentOperationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

    public async execute(adjustmentDto: AdjustmentOperationDto, userId: string): Promise<AdjustmentOperationResponse> {
        const { walletId, targetAmount, typeId, description } = adjustmentDto;

        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
        });

        if (!wallet || wallet.deleted) {
            throw new NotFoundException('Кошелек не найден');
        }

        const operationType = await this.prisma.operationType.findUnique({
            where: { id: typeId },
        });

        if (!operationType || operationType.deleted) {
            throw new NotFoundException('Тип операции не найден');
        }

        const currentAmount = wallet.amount;
        const adjustmentDescription = description || `Корректировка баланса с ${currentAmount} до ${targetAmount}`;

        return await this.prisma.$transaction(async (tx) => {
            const calculatedAmount = await this.walletRecalculationService.getCalculatedWalletAmount(tx, walletId);
            const difference = targetAmount - calculatedAmount;

            if (difference === 0) {
                await this.walletRecalculationService.recalculateWallet(tx, walletId, userId);

                return {
                    message: 'Баланс кошелька уже соответствует целевой сумме',
                    operation: null,
                    previousAmount: currentAmount,
                    newAmount: targetAmount,
                    adjustmentAmount: 0,
                };
            }

            const direction = difference > 0 ? OperationDirection.credit : OperationDirection.debit;
            const adjustmentAmount = Math.abs(difference);

            const operation = await tx.operation.create({
                data: {
                    userId,
                    updatedById: userId,
                    typeId,
                    description: adjustmentDescription,
                },
            });

            await tx.operationEntry.create({
                data: {
                    userId,
                    updatedById: userId,
                    operationId: operation.id,
                    walletId,
                    direction,
                    amount: adjustmentAmount,
                },
            });

            await this.walletRecalculationService.recalculateForOperation(tx, operation.id, userId);

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

            const actionType = direction === OperationDirection.credit ? 'пополнение' : 'списание';

            return {
                message: `Корректировка выполнена: ${actionType} на ${adjustmentAmount}`,
                operation: {
                    ...operationResponse,
                    type: addOperationTypeFlags(operationResponse.type),
                },
                previousAmount: currentAmount,
                newAmount: targetAmount,
                adjustmentAmount,
            };
        }, { timeout: 30000 });
    }
}
