import { Injectable } from '@nestjs/common';

import { Prisma, RoleCode } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { calculatePagination, createAllDataPaginationResponse, createPaginationResponse } from '../../common/utils';
import { addOperationTypeFlags } from '../../operation-type/constants/operation-type.constants';
import {
    canViewRestrictedExpenseOperations,
    EXPENSE_CATEGORIES,
    EXPENSE_OPERATION_TYPE_CODE,
} from '../constants/expense.constants';
import { GetOperationsDto } from '../dto';
import { GetOperationsResponse } from '../types';

@Injectable()
export class GetOperationsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        getOperationsDto: GetOperationsDto,
        currentUserRoles: RoleCode[] = [],
        currentUserId?: string,
    ): Promise<GetOperationsResponse> {
        const {
            search,
            typeId,
            userId,
            updatedById,
            conversionGroupId,
            walletId,
            applicationId,
            dateFrom,
            dateTo,
            direction,
            minAmount,
            maxAmount,
            sortField = 'createdAt',
            sortOrder = 'desc',
            page,
            limit,
        } = getOperationsDto;

        const pagination = calculatePagination({ page, limit });

        const where: Prisma.OperationWhereInput = {
            deleted: false,
        };

        if (!canViewRestrictedExpenseOperations(currentUserRoles)) {
            where.NOT = {
                AND: [
                    { type: { code: EXPENSE_OPERATION_TYPE_CODE } },
                    { expenseCategory: EXPENSE_CATEGORIES.SALARY },
                    ...(currentUserId ? [{ userId: { not: currentUserId } }] : []),
                ],
            };
        }

        if (search) {
            where.description = {
                contains: search,
                mode: 'insensitive',
            };
        }

        if (typeId) {
            where.typeId = typeId;
        }
        if (userId) {
            where.userId = userId;
        }
        if (updatedById) {
            where.updatedById = updatedById;
        }
        if (conversionGroupId) {
            where.conversionGroupId = conversionGroupId;
        }

        if (applicationId) {
            where.applicationId = applicationId;
        }

        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(dateTo);
            }
        }

        if (walletId || direction || minAmount !== undefined || maxAmount !== undefined) {
            const entryWhere: Prisma.OperationEntryWhereInput = {
                deleted: false,
            };

            if (walletId) {
                entryWhere.walletId = walletId;
            }
            if (direction) {
                entryWhere.direction = direction;
            }

            if (minAmount !== undefined || maxAmount !== undefined) {
                entryWhere.amount = {};
                if (minAmount !== undefined) {
                    entryWhere.amount.gte = minAmount;
                }
                if (maxAmount !== undefined) {
                    entryWhere.amount.lte = maxAmount;
                }
            }

            where.entries = {
                some: entryWhere,
            };
        }

        const total = await this.prisma.operation.count({ where });

        const baseOptions = {
            where,
            orderBy: {
                [sortField]: sortOrder,
            },
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
                                currency: true,
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
        } satisfies Prisma.OperationFindManyArgs;

        const findManyOptions = pagination.shouldPaginate
            ? {
                  ...baseOptions,
                  skip: pagination.skip,
                  take: pagination.take,
              }
            : baseOptions;

        const operations = await this.prisma.operation.findMany(findManyOptions);

        const operationsResponse = operations.map(({ deleted: _, ...operation }) => ({
            ...operation,
            type: addOperationTypeFlags(operation.type),
        }));

        // console.warn(operations);
        // console.warn(operationsResponse[0].entries[0].wallet.currency.code);

        const paginationResponse = pagination.shouldPaginate
            ? createPaginationResponse(total, page!, limit!)
            : createAllDataPaginationResponse(total);

        return {
            operations: operationsResponse,
            pagination: paginationResponse,
        };
    }
}
