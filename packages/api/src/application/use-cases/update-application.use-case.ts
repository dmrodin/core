import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { RoleCode } from '../../../prisma/generated/prisma';

import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { UpdateApplicationDto } from '../dto';
import { UpdateApplicationOutput } from '../types';

@Injectable()
export class UpdateApplicationUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        applicationId: number,
        updateApplicationDto: UpdateApplicationDto,
        updatedById: string,
        currentUserRoles: RoleCode[] = [],
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

        const canEditApplicationFully =
            currentUserRoles.includes(RoleCode.admin) || currentUserRoles.includes(RoleCode.moderator);

        if (!canEditApplicationFully) {
            const hasNonStatusChanges = [
                description,
                amount,
                currencyId,
                operationTypeId,
                assigneeUserId,
                operationId,
                telegramUsername,
                phone,
                meetingDate,
                advance,
            ].some((value) => value !== undefined);

            if (hasNonStatusChanges) {
                throw new ForbiddenException('Пользователь может изменять только статус заявки');
            }
        }

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

        const application = await this.prisma.application.update({
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
                ...(hasAdvance !== undefined && { hasAdvance }),
                ...(advance !== undefined && {
                    advance: {
                        update: {
                            amount: advance.amount ?? 0,
                            currencyId: advance.currencyId ?? existingApplication.currencyId,
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

        const { deleted: _, ...applicationResponse } = application;

        return {
            message: 'Заявка успешно обновлена',
            application: {
                ...applicationResponse,
                advance: applicationResponse.advance
                    ? {
                          amount: applicationResponse.advance.amount,
                          currency: applicationResponse.advance.currencyId,
                      }
                    : null,
                operation_type: addOperationTypeFlags(applicationResponse.operation_type),
            },
        };
    }
}
