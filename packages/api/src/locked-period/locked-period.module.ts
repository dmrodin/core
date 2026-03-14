import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LockedPeriodController } from './locked-period.controller';
import { CreateLockedPeriodUseCase, GetLockedPeriodsUseCase, OpenLockedPeriodUseCase } from './use-cases';

@Module({
    controllers: [LockedPeriodController],
    providers: [CreateLockedPeriodUseCase, GetLockedPeriodsUseCase, OpenLockedPeriodUseCase, JwtAuthGuard, RolesGuard],
    exports: [GetLockedPeriodsUseCase, CreateLockedPeriodUseCase, OpenLockedPeriodUseCase],
})
export class LockedPeriodModule {}
