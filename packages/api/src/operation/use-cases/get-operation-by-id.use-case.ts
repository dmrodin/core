import { Injectable, NotFoundException } from '@nestjs/common';

import { RoleCode } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags } from '../../operation-type/constants/operation-type.constants';
import { canViewRestrictedExpenseOperations, isRestrictedExpenseOperation } from '../constants/expense.constants';
import { OperationResponse } from '../types';

@Injectable()
export class GetOperationByIdUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(operationId: string, currentUserRoles: RoleCode[] = []): Promise<OperationResponse> {
        const operation = await this.prisma.operation.findUnique({
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

        if (!operation || operation.deleted) {
            throw new NotFoundException('Операция не найдена');
        }

        if (
            !canViewRestrictedExpenseOperations(currentUserRoles) &&
            isRestrictedExpenseOperation(operation.type?.code, operation.expenseCategory)
        ) {
            throw new NotFoundException('Операция не найдена');
        }

        const { deleted: _, ...operationResponse } = operation;

        return {
            ...operationResponse,
            type: addOperationTypeFlags(operationResponse.type),
        };
    }
}
