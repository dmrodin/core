import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { OPERATION_TYPE_CODES, SYSTEM_OPERATION_TYPE_CODES } from '../constants/operation-type.constants';
import { GetOperationTypeByIdResponse } from '../types';

@Injectable()
export class GetOperationTypeByIdUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(operationTypeId: string): Promise<GetOperationTypeByIdResponse> {
        const operationType = await this.prisma.operationType.findUnique({
            where: { id: operationTypeId },
            select: {
                id: true,
                userId: true,
                updatedById: true,
                code: true,
                name: true,
                description: true,
                isSeparateTab: true,
                isDebit: true,
                isCredit: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                deleted: true,
            },
        });

        if (!operationType || operationType.deleted) {
            throw new NotFoundException('Тип операции не найден');
        }

        const { deleted: _, ...operationTypeResponse } = operationType;

        return {
            operationType: {
                ...operationTypeResponse,
                isSystem: SYSTEM_OPERATION_TYPE_CODES.includes(operationTypeResponse.code),
                isCorrection: operationTypeResponse.code === OPERATION_TYPE_CODES.CORRECTION,
                isConversion: operationTypeResponse.code === OPERATION_TYPE_CODES.CONVERSION,
                isAvans: operationTypeResponse.code === OPERATION_TYPE_CODES.AVANS,
            },
        };
    }
}
