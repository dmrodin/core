import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WalletRecalculationService } from '../wallet/services/wallet-recalculation.service';
import { OperationController } from './operation.controller';
import {
    AdjustmentOperationUseCase,
    CreateOperationUseCase,
    DeleteOperationUseCase,
    GenerateBalancesReportUseCase,
    GenerateClosingPeriodReportUseCase,
    GenerateConversionReportUseCase,
    GenerateConversionWalletsReportUseCase,
    GenerateOperationsReportUseCase,
    GenerateOperationsWalletsReportUseCase,
    GetOperationByIdUseCase,
    GetOperationsUseCase,
    UpdateOperationUseCase,
} from './use-cases';

@Module({
    controllers: [OperationController],
    providers: [
        AdjustmentOperationUseCase,
        GenerateBalancesReportUseCase,
        GenerateClosingPeriodReportUseCase,
        GenerateOperationsReportUseCase,
        GenerateConversionReportUseCase,
        GenerateConversionWalletsReportUseCase,
        GenerateOperationsWalletsReportUseCase,
        CreateOperationUseCase,
        DeleteOperationUseCase,
        GetOperationByIdUseCase,
        GetOperationsUseCase,
        UpdateOperationUseCase,
        WalletRecalculationService,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [
        AdjustmentOperationUseCase,
        GenerateBalancesReportUseCase,
        GenerateClosingPeriodReportUseCase,
        GenerateOperationsReportUseCase,
        GenerateConversionReportUseCase,
        GenerateConversionWalletsReportUseCase,
        GenerateOperationsWalletsReportUseCase,
        CreateOperationUseCase,
        DeleteOperationUseCase,
        GetOperationByIdUseCase,
        GetOperationsUseCase,
        UpdateOperationUseCase,
        WalletRecalculationService,
    ],
})
export class OperationModule {}
