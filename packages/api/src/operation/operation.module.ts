import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../common/services/prisma.service';
import { WalletRecalculationService } from '../wallet/services/wallet-recalculation.service';
import { OperationController } from './operation.controller';
import {
    AdjustmentOperationUseCase,
    CreateOperationUseCase,
    DeleteOperationUseCase,
    GenerateBalancesReportUseCase,
    GenerateClosingPeriodReportUseCase,
    GenerateConversionReportUseCase,
    GenerateOperationsReportUseCase,
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
        CreateOperationUseCase,
        DeleteOperationUseCase,
        GetOperationByIdUseCase,
        GetOperationsUseCase,
        UpdateOperationUseCase,
        PrismaService,
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
        CreateOperationUseCase,
        DeleteOperationUseCase,
        GetOperationByIdUseCase,
        GetOperationsUseCase,
        UpdateOperationUseCase,
        PrismaService,
        WalletRecalculationService,
    ],
})
export class OperationModule {}
