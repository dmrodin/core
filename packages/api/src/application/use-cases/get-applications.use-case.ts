import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { calculatePagination, createAllDataPaginationResponse, createPaginationResponse } from '../../common/utils';
import { addOperationTypeFlags } from '../../operation-type/constants/operation-type.constants';
import { GetApplicationsDto } from '../dto';
import { GetApplicationsOutput } from '../types';

@Injectable()
export class GetApplicationsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(getApplicationsDto: GetApplicationsDto): Promise<GetApplicationsOutput> {
        const {
            search,
            status,
            minAmount,
            maxAmount,
            currencyId,
            operationTypeId,
            userId,
            assigneeUserId,
            updatedById,
            createdFrom,
            createdTo,
            meetingDateFrom,
            meetingDateTo,
            sortField = 'createdAt',
            sortOrder = 'desc',
            page,
            limit,
        } = getApplicationsDto;

        const pagination = calculatePagination({ page, limit });

        const where: Prisma.ApplicationWhereInput = {
            deleted: false,
        };

        if (search) {
            where.OR = [
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    phone: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    telegramUsername: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            where.amount = {};
            if (minAmount !== undefined) {
                where.amount.gte = minAmount;
            }
            if (maxAmount !== undefined) {
                where.amount.lte = maxAmount;
            }
        }

        if (currencyId) {
            where.currencyId = currencyId;
        }
        if (operationTypeId) {
            where.operationTypeId = operationTypeId;
        }
        if (userId) {
            where.userId = userId;
        }
        if (assigneeUserId) {
            where.assigneeUserId = assigneeUserId;
        }
        if (updatedById) {
            where.updatedById = updatedById;
        }

        if (createdFrom || createdTo) {
            where.createdAt = {};
            if (createdFrom) {
                where.createdAt.gte = new Date(createdFrom);
            }
            if (createdTo) {
                where.createdAt.lte = new Date(createdTo);
            }
        }

        if (meetingDateFrom || meetingDateTo) {
            where.meetingDate = {};
            if (meetingDateFrom) {
                where.meetingDate.gte = new Date(meetingDateFrom);
            }
            if (meetingDateTo) {
                where.meetingDate.lte = new Date(meetingDateTo);
            }
        }

        const total = await this.prisma.application.count({ where });

        const baseOptions = {
            where,
            orderBy: {
                [sortField]: sortOrder,
            },
            include: {
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
                assignee_user: {
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
                operation_type: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                operation: {
                    select: {
                        id: true,
                        description: true,
                    },
                },
                advance: {
                    include: {
                        currency: {
                            select: {
                                code: true,
                            },
                        },
                    },
                },
            },
        };

        const findManyOptions = pagination.shouldPaginate
            ? {
                  ...baseOptions,
                  skip: pagination.skip,
                  take: pagination.take,
              }
            : baseOptions;

        const applications = await this.prisma.application.findMany(findManyOptions);

        const applicationsResponse = applications.map(({ deleted: _, advance, ...application }) => ({
            ...application,
            operation_type: addOperationTypeFlags(application.operation_type),
            advance: advance
                ? {
                      amount: advance.amount,
                      currency: advance.currency?.code,
                  }
                : null,
        }));

        const paginationResponse = pagination.shouldPaginate
            ? createPaginationResponse(total, page!, limit!)
            : createAllDataPaginationResponse(total);

        return {
            applications: applicationsResponse,
            pagination: paginationResponse,
        };
    }
}
