import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GuideController } from './guide.controller';
import {
    CreateGuideUseCase,
    DeleteGuideUseCase,
    GetGuideByIdUseCase,
    GetGuidesUseCase,
    UpdateGuideUseCase,
} from './use-cases';

@Module({
    controllers: [GuideController],
    providers: [
        CreateGuideUseCase,
        GetGuideByIdUseCase,
        GetGuidesUseCase,
        UpdateGuideUseCase,
        DeleteGuideUseCase,
        JwtAuthGuard,
        RolesGuard,
    ],
})
export class GuideModule {}
