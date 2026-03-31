import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags } from '../../operation-type/constants/operation-type.constants';
import { GetApplicationByIdOutput } from '../types';

@Injectable()
export class GetApplicationByIdUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(applicationId: number): Promise<GetApplicationByIdOutput> {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
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
                        entries: {
                            select: {
                                walletId: true,
                                direction: true,
                                amount: true,
                            },
                        },
                    },
                },
                advance: {
                    select: {
                        amount: true,
                        currencyId: true,
                    },
                },
            },
        });

        if (!application || application.deleted) {
            throw new NotFoundException('Заявка не найдена');
        }

        const { deleted: _, ...applicationResponse } = application;
        const advanceEntries =
            applicationResponse.hasAdvance && applicationResponse.operation?.entries?.length
                ? applicationResponse.operation.entries.map((entry) => ({
                      walletId: entry.walletId,
                      direction: entry.direction,
                      amount: entry.amount,
                  }))
                : null;

        return {
            application: {
                ...applicationResponse,
                operation: applicationResponse.operation
                    ? {
                          id: applicationResponse.operation.id,
                          description: applicationResponse.operation.description,
                      }
                    : null,
                advance: applicationResponse.advance
                    ? {
                          amount: applicationResponse.advance.amount,
                          currency: applicationResponse.advance.currencyId,
                      }
                    : null,
                advanceEntries,
                operation_type: addOperationTypeFlags(applicationResponse.operation_type),
            },
        };
    }
}
