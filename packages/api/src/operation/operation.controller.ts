import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { RoleCode } from '../../prisma/generated/prisma';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiCrudResponses, ApiIdParam, ApiListParams, ApiReadResponses, ApiTag } from '../common';
import {
    AdjustmentOperationDto,
    AdjustmentOperationResponseDto,
    CreateOperationDto,
    CreateOperationResponseDto,
    DeleteOperationResponseDto,
    GetBalancesReportDto,
    GetClosingPeriodReportDto,
    GetConversionReportDto,
    GetConversionWalletsReportDto,
    GetOperationsDto,
    GetOperationsReportDto,
    GetOperationsResponseDto,
    GetOperationsWalletsReportDto,
    OperationResponseDto,
    UpdateOperationDto,
    UpdateOperationResponseDto,
} from './dto';
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

@ApiTag('Operations', 'Операции и транзакции')
@ApiBearerAuth('access-token')
@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationController {
    private static readonly REPORT_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    constructor(
        private readonly adjustmentOperationUseCase: AdjustmentOperationUseCase,
        private readonly generateBalancesReportUseCase: GenerateBalancesReportUseCase,
        private readonly generateClosingPeriodReportUseCase: GenerateClosingPeriodReportUseCase,
        private readonly generateOperationsReportUseCase: GenerateOperationsReportUseCase,
        private readonly generateConversionReportUseCase: GenerateConversionReportUseCase,
        private readonly generateConversionWalletsReportUseCase: GenerateConversionWalletsReportUseCase,
        private readonly generateOperationsWalletsReportUseCase: GenerateOperationsWalletsReportUseCase,
        private readonly createOperationUseCase: CreateOperationUseCase,
        private readonly getOperationsUseCase: GetOperationsUseCase,
        private readonly getOperationByIdUseCase: GetOperationByIdUseCase,
        private readonly updateOperationUseCase: UpdateOperationUseCase,
        private readonly deleteOperationUseCase: DeleteOperationUseCase,
    ) {}

    @Get('reports/general')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Выгрузить общий отчет по операциям',
        description: 'Формирует Excel-отчет с детализацией операций и движением по кошелькам.',
    })
    @ApiResponse({ status: 200, description: 'Отчет сформирован' })
    public async downloadOperationsReport(@Query() dto: GetOperationsReportDto): Promise<StreamableFile> {
        const report = await this.generateOperationsReportUseCase.execute(dto);

        return this.buildStreamableFile(report.buffer, report.filename);
    }

    @Get('reports/conversion')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Выгрузить отчет по конвертациям',
        description: 'Формирует Excel-отчет по операциям конвертации с расчетом курса обмена.',
    })
    @ApiResponse({ status: 200, description: 'Отчет сформирован' })
    public async downloadConversionReport(@Query() dto: GetConversionReportDto): Promise<StreamableFile> {
        const report = await this.generateConversionReportUseCase.execute(dto);

        return this.buildStreamableFile(report.buffer, report.filename);
    }

    @Get('reports/conversion-wallets')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Выгрузить отчет по конвертациям с фильтром по разделам кошельков',
        description: 'Формирует Excel-отчет по операциям конвертации с фильтрацией по разделам кошельков.',
    })
    @ApiResponse({ status: 200, description: 'Отчет сформирован' })
    public async downloadConversionWalletsReport(@Query() dto: GetConversionWalletsReportDto): Promise<StreamableFile> {
        const report = await this.generateConversionWalletsReportUseCase.execute(dto);

        return this.buildStreamableFile(report.buffer, report.filename);
    }

    @Get('reports/operations-wallets')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Выгрузить общий отчет по операциям с фильтром по разделам кошельков',
        description: 'Формирует Excel-отчет по всем операциям с фильтрацией по разделам кошельков.',
    })
    @ApiResponse({ status: 200, description: 'Отчет сформирован' })
    public async downloadOperationsWalletsReport(@Query() dto: GetOperationsWalletsReportDto): Promise<StreamableFile> {
        const report = await this.generateOperationsWalletsReportUseCase.execute(dto);

        return this.buildStreamableFile(report.buffer, report.filename);
    }

    @Get('reports/closing-period')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Выгрузить отчет по остаткам на конец периода',
        description: 'Формирует Excel по текущим остаткам кошельков, с возможностью фильтрации по типу.',
    })
    @ApiResponse({ status: 200, description: 'Отчет сформирован' })
    public async downloadClosingPeriodReport(@Query() dto: GetClosingPeriodReportDto): Promise<StreamableFile> {
        const report = await this.generateClosingPeriodReportUseCase.execute(dto);

        return this.buildStreamableFile(report.buffer, report.filename);
    }

    @Get('reports/balances')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Выгрузить отчет по балансам кошельков',
        description: 'Формирует Excel-отчет с балансами кошельков на выбранную дату и время с фильтрацией по разделам.',
    })
    @ApiResponse({ status: 200, description: 'Отчет сформирован' })
    public async downloadBalancesReport(@Query() dto: GetBalancesReportDto): Promise<StreamableFile> {
        const report = await this.generateBalancesReportUseCase.execute(dto);

        return this.buildStreamableFile(report.buffer, report.filename);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить список операций',
        description: 'Возвращает список операций с поддержкой фильтрации, поиска и пагинации.',
    })
    @ApiListParams('Фильтры, поиск и пагинация для списка операций')
    @ApiResponse({
        status: 200,
        description: 'Список операций успешно получен',
        type: GetOperationsResponseDto,
    })
    @ApiReadResponses()
    public async getOperations(
        @Query() getOperationsDto: GetOperationsDto,
        @Req() request: { user?: { roles?: RoleCode[] } },
    ): Promise<GetOperationsResponseDto> {
        const result = await this.getOperationsUseCase.execute(getOperationsDto, request.user?.roles ?? []);

        return {
            operations: result.operations,
            pagination: result.pagination,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить операцию по ID',
        description: 'Возвращает подробную информацию о конкретной операции.',
    })
    @ApiIdParam('Уникальный идентификатор операции')
    @ApiResponse({
        status: 200,
        description: 'Операция найдена',
        type: OperationResponseDto,
    })
    @ApiReadResponses()
    public async getOperationById(
        @Param('id') operationId: string,
        @Req() request: { user?: { roles?: RoleCode[] } },
    ): Promise<OperationResponseDto> {
        return await this.getOperationByIdUseCase.execute(operationId, request.user?.roles ?? []);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Создать операцию',
        description: 'Создаёт новую операцию. Доступно администраторам и модераторам.',
    })
    @ApiBody({ type: CreateOperationDto })
    @ApiResponse({
        status: 201,
        description: 'Операция успешно создана',
        type: CreateOperationResponseDto,
    })
    @ApiCrudResponses()
    public async createOperation(
        @Body() createOperationDto: CreateOperationDto,
        @CurrentUserId() userId: string,
    ): Promise<CreateOperationResponseDto> {
        const result = await this.createOperationUseCase.execute(createOperationDto, userId);

        return {
            message: result.message,
            operation: result.operation,
        };
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Обновить операцию',
        description: 'Обновляет данные существующей операции. Доступно администраторам и модераторам.',
    })
    @ApiIdParam('Уникальный идентификатор операции')
    @ApiBody({ type: UpdateOperationDto })
    @ApiResponse({
        status: 200,
        description: 'Операция успешно обновлена',
        type: UpdateOperationResponseDto,
    })
    @ApiCrudResponses()
    public async updateOperation(
        @Param('id') operationId: string,
        @Body() updateOperationDto: UpdateOperationDto,
        @CurrentUserId() userId: string,
    ): Promise<UpdateOperationResponseDto> {
        const result = await this.updateOperationUseCase.execute(operationId, updateOperationDto, userId);

        return {
            message: result.message,
            operation: result.operation,
        };
    }

    @Post('adjustment')
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Создать корректировочную операцию',
        description: 'Создаёт корректировочную операцию для выравнивания баланса кошелька.',
    })
    @ApiBody({ type: AdjustmentOperationDto })
    @ApiResponse({
        status: 201,
        description: 'Корректировочная операция успешно обработана',
        type: AdjustmentOperationResponseDto,
    })
    @ApiCrudResponses()
    public async adjustmentOperation(
        @Body() adjustmentOperationDto: AdjustmentOperationDto,
        @CurrentUserId() userId: string,
    ): Promise<AdjustmentOperationResponseDto> {
        const result = await this.adjustmentOperationUseCase.execute(adjustmentOperationDto, userId);

        return {
            message: result.message,
            operation: result.operation,
            previousAmount: result.previousAmount,
            newAmount: result.newAmount,
            adjustmentAmount: result.adjustmentAmount,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Удалить операцию',
        description: 'Выполняет мягкое удаление операции.',
    })
    @ApiIdParam('Уникальный идентификатор операции')
    @ApiResponse({
        status: 200,
        description: 'Операция успешно удалена',
        type: DeleteOperationResponseDto,
    })
    @ApiReadResponses()
    public async deleteOperation(
        @Param('id') operationId: string,
        @CurrentUserId() userId: string,
    ): Promise<DeleteOperationResponseDto> {
        const result = await this.deleteOperationUseCase.execute(operationId, userId);

        return {
            message: result.message,
        };
    }

    private buildStreamableFile(buffer: Buffer, filename: string): StreamableFile {
        const safeFilename = filename.replace(/"/g, "'");
        const encodedFilename = encodeURIComponent(safeFilename);
        const disposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`;

        return new StreamableFile(buffer, {
            type: OperationController.REPORT_CONTENT_TYPE,
            disposition,
        });
    }
}
