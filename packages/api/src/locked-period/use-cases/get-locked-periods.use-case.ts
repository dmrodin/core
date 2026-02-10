import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';
import { GetLockedPeriodsResponseDto } from '../dto';

@Injectable()
export class GetLockedPeriodsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(): Promise<GetLockedPeriodsResponseDto> {
        const lockedPeriods = await this.prisma.lockedPeriod.findMany({
            orderBy: {
                lockedAt: 'desc',
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
            lockedPeriods,
        };
    }
}
