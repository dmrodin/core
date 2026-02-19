import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { CreateLockedPeriodDto, CreateLockedPeriodResponseDto } from '../dto';

@Injectable()
export class CreateLockedPeriodUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(
        createLockedPeriodDto: CreateLockedPeriodDto,
        userId: string,
    ): Promise<CreateLockedPeriodResponseDto> {
        const dateFrom = new Date(createLockedPeriodDto.dateFrom);
        const dateTo = new Date(createLockedPeriodDto.dateTo);

        if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
            throw new BadRequestException('Неверный формат дат');
        }

        if (dateFrom > dateTo) {
            throw new BadRequestException('Дата окончания должна быть не раньше даты начала');
        }

        const overlappingPeriod = await this.prisma.lockedPeriod.findFirst({
            where: {
                isActive: true,
                dateFrom: { lte: dateTo },
                dateTo: { gte: dateFrom },
            },
        });

        if (overlappingPeriod) {
            throw new BadRequestException('Период пересекается с уже закрытым периодом');
        }

        const lockedPeriod = await this.prisma.lockedPeriod.create({
            data: {
                dateFrom,
                dateTo,
                lockedById: userId,
            },
            select: {
                id: true,
                dateFrom: true,
                dateTo: true,
                lockedAt: true,
                isActive: true,
            },
        });

        return {
            message: 'Период блокировки создан',
            lockedPeriod,
        };
    }
}
