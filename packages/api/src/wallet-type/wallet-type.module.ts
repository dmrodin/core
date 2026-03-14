import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import {
    CreateWalletTypeUseCase,
    DeleteWalletTypeUseCase,
    GetWalletTypesUseCase,
    UpdateWalletTypeUseCase,
} from './use-cases';
import { WalletTypeController } from './wallet-type.controller';
import { WalletTypeInitService } from './wallet-type-init.service';

@Module({
    imports: [AuthModule],
    controllers: [WalletTypeController],
    providers: [
        GetWalletTypesUseCase,
        CreateWalletTypeUseCase,
        UpdateWalletTypeUseCase,
        DeleteWalletTypeUseCase,
        WalletTypeInitService,
    ],
})
export class WalletTypeModule {}
