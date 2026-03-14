import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WalletRecalculationService } from '../wallet/services/wallet-recalculation.service';
import { ApplicationController } from './application.controller';
import {
    CreateApplicationUseCase,
    DeleteApplicationUseCase,
    GetApplicationByIdUseCase,
    GetApplicationsUseCase,
    UpdateApplicationUseCase,
} from './use-cases';

@Module({
    controllers: [ApplicationController],
    providers: [
        WalletRecalculationService,
        JwtAuthGuard,
        RolesGuard,
        CreateApplicationUseCase,
        GetApplicationsUseCase,
        GetApplicationByIdUseCase,
        UpdateApplicationUseCase,
        DeleteApplicationUseCase,
    ],
    exports: [
        CreateApplicationUseCase,
        GetApplicationsUseCase,
        GetApplicationByIdUseCase,
        UpdateApplicationUseCase,
        DeleteApplicationUseCase,
    ],
})
export class ApplicationModule {}
