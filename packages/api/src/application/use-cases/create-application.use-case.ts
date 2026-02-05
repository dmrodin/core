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

        const operationAdvance = advance
            ? await this.prisma.operationType.findFirst({
                  where: { code: OPERATION_TYPE_CODES.AVANS },
                  select: { id: true },
              })
            : null;

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

                console.warn(operationAdvance);

                if (operationAdvance?.id) {
                    const op = await tx.operation.create({
                        data: {
                            applicationId: app.id,
                            description: `Аванс по заявке №${app.id}`,
                            userId,
                            updatedById: userId,
                            typeId: operationAdvance.id,
                            createdAt: new Date().toISOString(),
                        },
                    });

                    console.warn(`Created advance operation: ${op.id}`);
                } else {
                    console.warn('advance error');
                }
            }

            return app;
        });

        const { deleted: _, ...applicationResponse } = application;

        return {
            message: 'Заявка успешно создана',
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
