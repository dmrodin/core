import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { WalletRecalculationService } from '../../wallet/services/wallet-recalculation.service';
import { UpdateApplicationDto } from '../dto';
import { UpdateApplicationOutput } from '../types';

@Injectable()
export class UpdateApplicationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

    public async execute(
        applicationId: number,
        updateApplicationDto: UpdateApplicationDto,
        updatedById: string,
    ): Promise<UpdateApplicationOutput> {
        const {
            description,
            status,
            amount,
            currencyId,
            operationTypeId,
            assigneeUserId,
            operationId,
            telegramUsername,
            phone,
            meetingDate,
            advance,
        } = updateApplicationDto;

        const existingApplication = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });

        if (!existingApplication || existingApplication.deleted) {
            throw new NotFoundException('Заявка не найдена');
        }

        let hasAdvance: boolean | undefined;

        if (operationTypeId !== undefined) {
            const operationType = await this.prisma.operationType.findUnique({
                where: { id: operationTypeId },
                select: { name: true },
            });

            hasAdvance = operationType?.name === OPERATION_TYPE_CODES.AVANS;
        }

        const advanceEntries = advance?.entries ?? [];
        const hasAdvanceEntries = advanceEntries.length > 0;
        const hasLegacyAdvanceUpdate = advance?.amount !== undefined || advance?.currencyId !== undefined;
        const advanceType = hasAdvanceEntries
            ? await this.prisma.operationType.findFirst({
                  where: { code: OPERATION_TYPE_CODES.AVANS },
                  select: { id: true },
              })
            : null;

        let advanceOperationId: string | null = null;
        let advanceOperationDescription: string | null = null;

        const application = await this.prisma.$transaction(async (tx) => {
            const updatedApplication = await tx.application.update({
                where: { id: applicationId },
                data: {
                    updatedById,
                    ...(description !== undefined && { description }),
                    ...(status !== undefined && { status }),
                    ...(amount !== undefined && { amount }),
                    ...(currencyId !== undefined && { currencyId }),
                    ...(operationTypeId !== undefined && { operationTypeId }),
                    ...(assigneeUserId !== undefined && { assigneeUserId }),
                    ...(operationId !== undefined && { operationId }),
                    ...(telegramUsername !== undefined && { telegramUsername }),
                    ...(phone !== undefined && { phone }),
                    ...(meetingDate !== undefined && {
                        meetingDate: new Date(meetingDate),
                    }),
                    ...((hasAdvanceEntries || hasAdvance !== undefined) && {
                        hasAdvance: hasAdvanceEntries ? true : hasAdvance,
                    }),
                    ...(hasLegacyAdvanceUpdate && {
                        advance: {
                            upsert: {
                                update: {
                                    amount: advance?.amount ?? 0,
                                    currencyId: advance?.currencyId ?? existingApplication.currencyId,
                                },
                                create: {
                                    amount: advance?.amount ?? 0,
                                    currencyId: advance?.currencyId ?? existingApplication.currencyId,
                                },
                            },
                        },
                    }),
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

            if (hasAdvanceEntries && advanceType?.id) {
                advanceOperationId = updatedApplication.operation?.id ?? updatedApplication.operationId ?? null;

                const operationDescriptionLines: string[] = [];

                if (updatedApplication.telegramUsername) {
                    operationDescriptionLines.push(`Telegram: ${updatedApplication.telegramUsername}`);
                }
                if (updatedApplication.phone) {
                    operationDescriptionLines.push(`Телефон: ${updatedApplication.phone}`);
                }
                advanceOperationDescription = operationDescriptionLines.length
                    ? operationDescriptionLines.join('\n')
                    : null;

                if (!advanceOperationId) {
                    const createdOperation = await tx.operation.create({
                        data: {
                            applicationId: updatedApplication.id,
                            description: advanceOperationDescription,
                            userId: updatedById,
                            updatedById,
                            typeId: advanceType.id,
                            createdAt: new Date().toISOString(),
                        },
                    });

                    advanceOperationId = createdOperation.id;

                    await tx.application.update({
                        where: { id: updatedApplication.id },
                        data: {
                            operationId: createdOperation.id,
                            updatedById,
                        },
                    });
                } else {
                    await tx.operation.update({
                        where: { id: advanceOperationId },
                        data: {
                            description: advanceOperationDescription,
                            updatedById,
                            typeId: advanceType.id,
                        },
                    });

                    await tx.operationEntry.deleteMany({
                        where: { operationId: advanceOperationId },
                    });
                }

                await tx.operationEntry.createMany({
                    data: advanceEntries.map((entry) => ({
                        operationId: advanceOperationId!,
                        walletId: entry.walletId,
                        direction: entry.direction,
                        amount: entry.amount,
                        userId: updatedById,
                        updatedById,
                    })),
                });

                await this.walletRecalculationService.recalculateForOperation(tx, advanceOperationId, updatedById);
            }

            return updatedApplication;
        });

        const { deleted: _, ...applicationResponse } = application;
        const advanceEntriesResponse = hasAdvanceEntries
            ? advanceEntries.map((entry) => ({
                  walletId: entry.walletId,
                  direction: entry.direction,
                  amount: entry.amount,
              }))
            : applicationResponse.operation?.entries?.length
              ? applicationResponse.operation.entries.map((entry) => ({
                    walletId: entry.walletId,
                    direction: entry.direction,
                    amount: entry.amount,
                }))
              : null;

        return {
            message: 'Заявка успешно обновлена',
            application: {
                ...applicationResponse,
                operation: advanceOperationId
                    ? {
                          id: advanceOperationId,
                          description:
                              advanceOperationDescription ?? applicationResponse.operation?.description ?? null,
                      }
                    : applicationResponse.operation
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
                advanceEntries: advanceEntriesResponse,
                operation_type: addOperationTypeFlags(applicationResponse.operation_type),
            },
        };
    }
}
