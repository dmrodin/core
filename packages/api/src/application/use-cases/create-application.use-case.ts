import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { CreateApplicationDto } from '../dto';
import { CreateApplicationOutput } from '../types';

@Injectable()
export class CreateApplicationUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(createApplicationDto: CreateApplicationDto, userId: string): Promise<CreateApplicationOutput> {
        const {
            description,
            amount,
            currencyId,
            operationTypeId,
            assigneeUserId,
            telegramUsername,
            phone,
            meetingDate,
            advance,
        } = createApplicationDto;

        // Определяем, является ли это авансом по типу операции
        const operationType = await this.prisma.operationType.findUnique({
            where: { id: operationTypeId },
            select: { name: true },
        });

        const hasAdvance = operationType?.name === OPERATION_TYPE_CODES.AVANS;

        const application = await this.prisma.$transaction(async (tx) => {
            const app = await tx.application.create({
                data: {
                    userId,
                    updatedById: userId,
                    description,
                    amount,
                    currencyId,
                    operationTypeId,
                    assigneeUserId,
                    telegramUsername: telegramUsername ? `@${telegramUsername.replace(/^@/, '')}` : null,
                    phone,
                    meetingDate: new Date(meetingDate),
                    status: 'open',
                    hasAdvance,
                },
                include: {
                    created_by: { select: { id: true, username: true } },
                    updated_by: { select: { id: true, username: true } },
                    assignee_user: { select: { id: true, username: true } },
                    currency: { select: { id: true, name: true, code: true } },
                    operation_type: { select: { id: true, name: true, code: true } },
                    operation: { select: { id: true, description: true } },
                    advance: true,
                },
            });

            if (advance) {
                await tx.applicationAdvance.create({
                    data: {
                        applicationId: app.id,
                        amount: advance.amount,
                        currencyId: advance.currencyId,
                    },
                });
            }

            return app;
        });

        /* const application_old = await this.prisma.application.create({
            data: {
                userId,
                updatedById: userId,
                description,
                amount,
                currencyId,
                operationTypeId,
                assigneeUserId,
                telegramUsername,
                phone,
                meetingDate: new Date(meetingDate),
                status: 'open',
                hasAdvance,
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
            },
        }); */

        const { deleted: _, ...applicationResponse } = application;

        return {
            message: 'Заявка успешно создана',
            application: {
                ...applicationResponse,
                operation_type: addOperationTypeFlags(applicationResponse.operation_type),
            },
        };
    }
}
