import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { OpenLockedPeriodResponseDto } from '../dto';

@Injectable()
export class OpenLockedPeriodUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(periodId: string): Promise<OpenLockedPeriodResponseDto> {
        const existing = await this.prisma.lockedPeriod.findUnique({
            where: { id: periodId },
            select: {
                id: true,
                dateFrom: true,
                dateTo: true,
                lockedAt: true,
                isActive: true,
            },
        });

        if (!existing) {
            throw new NotFoundException('Период блокировки не найден');
        }

        if (!existing.isActive) {
            return {
                message: 'Период уже открыт',
                lockedPeriod: existing,
            };
        }

        const lockedPeriod = await this.prisma.lockedPeriod.update({
            where: { id: periodId },
            data: {
                isActive: false,
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
            message: 'Период успешно открыт',
            lockedPeriod,
        };
    }
}
