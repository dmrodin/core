import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { WalletRecalculationService } from '../../wallet/services/wallet-recalculation.service';
import { DeleteOperationResponse } from '../types';

@Injectable()
export class DeleteOperationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletRecalculationService: WalletRecalculationService,
    ) {}

    public async execute(operationId: string, deletedById: string): Promise<DeleteOperationResponse> {
        const operation = await this.prisma.operation.findUnique({
            where: { id: operationId },
            include: {
                entries: {
                    where: { deleted: false },
                    select: {
                        walletId: true,
                        direction: true,
                        amount: true,
                    },
                },
            },
        });

        if (!operation || operation.deleted) {
            throw new NotFoundException('Операция не найдена');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.operation.update({
                where: { id: operationId },
                data: {
                    deleted: true,
                    updatedById: deletedById,
                    applicationId: null,
                },
            });

            await this.walletRecalculationService.recalculateForOperation(tx, operationId, deletedById);
        }, { timeout: 30000 });

        return {
            message: 'Операция успешно удалена',
        };
    }
}
