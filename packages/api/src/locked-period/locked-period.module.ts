import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../common/services/prisma.service';
import { LockedPeriodController } from './locked-period.controller';
import { CreateLockedPeriodUseCase, GetLockedPeriodsUseCase, OpenLockedPeriodUseCase } from './use-cases';

@Module({
    controllers: [LockedPeriodController],
    providers: [
        CreateLockedPeriodUseCase,
        GetLockedPeriodsUseCase,
        OpenLockedPeriodUseCase,
        PrismaService,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [GetLockedPeriodsUseCase, CreateLockedPeriodUseCase, OpenLockedPeriodUseCase, PrismaService],
})
export class LockedPeriodModule {}
