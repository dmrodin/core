import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { addOperationTypeFlags, OPERATION_TYPE_CODES } from '../../operation-type/constants/operation-type.constants';
import { WalletRecalculationService } from '../../wallet/services/wallet-recalculation.service';
import { CreateApplicationDto } from '../dto';
import { CreateApplicationOutput } from '../types';

@Injectable()
export class CreateApplicationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

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

        const operationType = await this.prisma.operationType.findUnique({
            where: { id: operationTypeId },
            select: { code: true },
        });

        const advanceType = advance
            ? await this.prisma.operationType.findFirst({
                  where: { code: OPERATION_TYPE_CODES.AVANS },
                  select: { id: true },
              })
            : null;

        const advanceEntries = advance?.entries ?? [];
        const hasAdvanceEntries = advanceEntries.length > 0;
        const hasLegacyAdvance = typeof advance?.amount === 'number' && !!advance?.currencyId;
        const hasAdvance = hasAdvanceEntries || hasLegacyAdvance || operationType?.code === OPERATION_TYPE_CODES.AVANS;

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

            if (hasLegacyAdvance) {
                await tx.applicationAdvance.create({
                    data: {
                        applicationId: app.id,
                        amount: advance.amount!,
                        currencyId: advance.currencyId!,
                    },
                });
            }

            if (hasAdvanceEntries && advanceType?.id) {
                const operationDescriptionLines: string[] = [];

                if (app.telegramUsername) {
                    operationDescriptionLines.push(`Telegram: ${app.telegramUsername}`);
                }

                if (app.phone) {
                    operationDescriptionLines.push(`Телефон: ${app.phone}`);
                }

                const createdOperation = await tx.operation.create({
                    data: {
                        applicationId: app.id,
                        description: operationDescriptionLines.length ? operationDescriptionLines.join('\n') : null,
                        userId,
                        updatedById: userId,
                        typeId: advanceType.id,
                        createdAt: new Date().toISOString(),
                    },
                });

                for (const entry of advanceEntries) {
                    await tx.operationEntry.create({
                        data: {
                            operationId: createdOperation.id,
                            walletId: entry.walletId,
                            direction: entry.direction,
                            amount: entry.amount,
                            userId,
                            updatedById: userId,
                        },
                    });
                }

                await tx.application.update({
                    where: { id: app.id },
                    data: {
                        operationId: createdOperation.id,
                        updatedById: userId,
                    },
                });

                await this.walletRecalculationService.recalculateForOperation(tx, createdOperation.id, userId);
            }

            return app;
        });

        const { deleted: _, ...applicationResponse } = application;
        const advanceEntriesResponse = hasAdvanceEntries
            ? advanceEntries.map((entry) => ({
                  walletId: entry.walletId,
                  direction: entry.direction,
                  amount: entry.amount,
              }))
            : null;

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
                advanceEntries: advanceEntriesResponse,
                operation_type: addOperationTypeFlags(applicationResponse.operation_type),
            },
        };
    }
}
