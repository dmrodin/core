import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionController } from './session.controller';
import { DeactivateMySessionByIdUseCase, DeactivateUserSessionsUseCase, GetSessionsUseCase } from './use-cases';

@Module({
    controllers: [SessionController],
    providers: [
        JwtAuthGuard,
        RolesGuard,
        GetSessionsUseCase,
        DeactivateUserSessionsUseCase,
        DeactivateMySessionByIdUseCase,
    ],
    exports: [GetSessionsUseCase, DeactivateUserSessionsUseCase],
})
export class SessionModule {}
