import { Module } from '@nestjs/common';

import { PlatformController } from './platform.controller';
import { PlatformInitService } from './platform-init.service';
import {
    CreatePlatformUseCase,
    DeletePlatformUseCase,
    GetPlatformByIdUseCase,
    GetPlatformsUseCase,
    RestorePlatformUseCase,
    UpdatePlatformUseCase,
} from './use-cases';

@Module({
    controllers: [PlatformController],
    providers: [
        PlatformInitService,
        CreatePlatformUseCase,
        GetPlatformsUseCase,
        GetPlatformByIdUseCase,
        UpdatePlatformUseCase,
        DeletePlatformUseCase,
        RestorePlatformUseCase,
    ],
    exports: [],
})
export class PlatformModule {}
