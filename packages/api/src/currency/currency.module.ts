import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrencyController } from './currency.controller';
import { CurrencyInitService } from './currency-init.service';
import {
    CreateCurrencyUseCase,
    DeleteCurrencyUseCase,
    GetCurrenciesUseCase,
    GetCurrencyByIdUseCase,
    RestoreCurrencyUseCase,
    UpdateCurrencyUseCase,
} from './use-cases';

@Module({
    controllers: [CurrencyController],
    providers: [
        CreateCurrencyUseCase,
        GetCurrencyByIdUseCase,
        GetCurrenciesUseCase,
        UpdateCurrencyUseCase,
        DeleteCurrencyUseCase,
        RestoreCurrencyUseCase,
        JwtAuthGuard,
        RolesGuard,
        CurrencyInitService,
    ],
})
export class CurrencyModule {}
