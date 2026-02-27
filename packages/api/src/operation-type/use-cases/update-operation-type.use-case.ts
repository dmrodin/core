import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { OPERATION_TYPE_CODES, SYSTEM_OPERATION_TYPE_CODES } from '../constants/operation-type.constants';
import { UpdateOperationTypeDto } from '../dto';
import { UpdateOperationTypeResponse } from '../types';

@Injectable()
export class UpdateOperationTypeUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        operationTypeId: string,
        updateOperationTypeDto: UpdateOperationTypeDto,
        updatedById: string,
    ): Promise<UpdateOperationTypeResponse> {
        const existingOperationType = await this.prisma.operationType.findUnique({
            where: { id: operationTypeId },
            select: {
                id: true,
                code: true,
                deleted: true,
            },
        });

        if (!existingOperationType || existingOperationType.deleted) {
            throw new NotFoundException('Тип операции не найден');
        }

        if (
            updateOperationTypeDto.code !== undefined &&
            SYSTEM_OPERATION_TYPE_CODES.includes(existingOperationType.code) &&
            updateOperationTypeDto.code !== existingOperationType.code
        ) {
            throw new BadRequestException('Нельзя изменить код системного типа операции');
        }

        const operationType = await this.prisma.operationType.update({
            where: { id: operationTypeId },
            data: {
                updatedById,
                ...(updateOperationTypeDto.code !== undefined && {
                    code: updateOperationTypeDto.code,
                }),
                ...(updateOperationTypeDto.name !== undefined && {
                    name: updateOperationTypeDto.name,
                }),
                ...(updateOperationTypeDto.description !== undefined && {
                    description: updateOperationTypeDto.description,
                }),
                ...(updateOperationTypeDto.isSeparateTab !== undefined && {
                    isSeparateTab: updateOperationTypeDto.isSeparateTab,
                }),
                ...(updateOperationTypeDto.isDebit !== undefined && {
                    isDebit: updateOperationTypeDto.isDebit,
                }),
                ...(updateOperationTypeDto.isCredit !== undefined && {
                    isCredit: updateOperationTypeDto.isCredit,
                }),
                ...(updateOperationTypeDto.active !== undefined && {
                    active: updateOperationTypeDto.active,
                }),
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
            message: 'Тип операции успешно обновлён',
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
