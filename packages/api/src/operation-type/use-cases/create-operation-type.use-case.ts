import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { OPERATION_TYPE_CODES, SYSTEM_OPERATION_TYPE_CODES } from '../constants/operation-type.constants';
import { CreateOperationTypeDto } from '../dto';
import { CreateOperationTypeResponse } from '../types';

@Injectable()
export class CreateOperationTypeUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        createOperationTypeDto: CreateOperationTypeDto,
        userId: string,
    ): Promise<CreateOperationTypeResponse> {
        const { code, name, description, isSeparateTab, isDebit, isCredit, active } = createOperationTypeDto;

        const operationType = await this.prisma.operationType.create({
            data: {
                userId,
                updatedById: userId,
                code,
                name,
                description,
                isSeparateTab,
                isDebit: isDebit ?? true,
                isCredit: isCredit ?? true,
                active: active ?? true,
            },
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
            },
        });

        return {
            message: 'Тип операции успешно создан',
            operationType: {
                ...operationType,
                isSystem: SYSTEM_OPERATION_TYPE_CODES.includes(operationType.code),
                isCorrection: operationType.code === OPERATION_TYPE_CODES.CORRECTION,
                isConversion: operationType.code === OPERATION_TYPE_CODES.CONVERSION,
                isAvans: operationType.code === OPERATION_TYPE_CODES.AVANS,
            },
        };
    }
}
