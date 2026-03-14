import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NetworkController } from './network.controller';
import { NetworkInitService } from './network-init.service';
import {
    CreateNetworkUseCase,
    DeleteNetworkUseCase,
    GetNetworkByIdUseCase,
    GetNetworksUseCase,
    RestoreNetworkUseCase,
    UpdateNetworkUseCase,
} from './use-cases';

@Module({
    controllers: [NetworkController],
    providers: [
        NetworkInitService,
        CreateNetworkUseCase,
        GetNetworkByIdUseCase,
        GetNetworksUseCase,
        UpdateNetworkUseCase,
        DeleteNetworkUseCase,
        RestoreNetworkUseCase,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [
        CreateNetworkUseCase,
        GetNetworkByIdUseCase,
        GetNetworksUseCase,
        UpdateNetworkUseCase,
        DeleteNetworkUseCase,
    ],
})
export class NetworkModule {}
