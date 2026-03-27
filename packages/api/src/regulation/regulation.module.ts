import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RegulationController } from './regulation.controller';
import {
    DeleteRegulationUseCase,
    DownloadRegulationUseCase,
    GetRegulationsUseCase,
    UploadRegulationUseCase,
} from './use-cases';

@Module({
    controllers: [RegulationController],
    providers: [
        UploadRegulationUseCase,
        GetRegulationsUseCase,
        DownloadRegulationUseCase,
        DeleteRegulationUseCase,
        JwtAuthGuard,
        RolesGuard,
    ],
})
export class RegulationModule {}
