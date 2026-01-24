import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
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
    CreateOperationTypeDto,
    CreateOperationTypeResponseDto,
    DeleteOperationTypeResponseDto,
    GetOperationTypesDto,
    GetOperationTypesResponseDto,
    OperationTypeResponseDto,
    UpdateOperationTypeDto,
    UpdateOperationTypeResponseDto,
} from './dto';
import {
    CreateOperationTypeUseCase,
    DeleteOperationTypeUseCase,
    GetOperationTypeByIdUseCase,
    GetOperationTypesUseCase,
    RestoreOperationTypeUseCase,
    UpdateOperationTypeUseCase,
} from './use-cases';

@ApiTag('Operation Types', 'Управление типами операций')
@ApiBearerAuth('access-token')
@Controller('operation-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationTypeController {
    constructor(
        private readonly createOperationTypeUseCase: CreateOperationTypeUseCase,
        private readonly getOperationTypeByIdUseCase: GetOperationTypeByIdUseCase,
        private readonly getOperationTypesUseCase: GetOperationTypesUseCase,
        private readonly updateOperationTypeUseCase: UpdateOperationTypeUseCase,
        private readonly deleteOperationTypeUseCase: DeleteOperationTypeUseCase,
        private readonly restoreOperationTypeUseCase: RestoreOperationTypeUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Создать новый тип операции',
        description: 'Создаёт новый тип операции. Доступно администраторам и модераторам.',
    })
    @ApiBody({ type: CreateOperationTypeDto })
    @ApiResponse({
        status: 201,
        description: 'Тип операции успешно создан',
        type: CreateOperationTypeResponseDto,
    })
    @ApiCrudResponses()
    public async createOperationType(
        @Body() createOperationTypeDto: CreateOperationTypeDto,
        @CurrentUserId() userId: string,
    ): Promise<CreateOperationTypeResponseDto> {
        const result = await this.createOperationTypeUseCase.execute(createOperationTypeDto, userId);

        return {
            message: result.message,
            operationType: result.operationType,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Получить список типов операций',
        description: 'Возвращает список типов операций с поддержкой фильтрации, поиска и пагинации.',
    })
    @ApiListParams('Фильтры, поиск и пагинация для списка типов операций')
    @ApiResponse({
        status: 200,
        description: 'Список типов операций успешно получен',
        type: GetOperationTypesResponseDto,
    })
    @ApiReadResponses()
    public async getOperationTypes(
        @Query() getOperationTypesDto: GetOperationTypesDto,
    ): Promise<GetOperationTypesResponseDto> {
        const result = await this.getOperationTypesUseCase.execute(getOperationTypesDto);

        return {
            operationTypes: result.operationTypes,
            pagination: result.pagination,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Получить тип операции по ID',
        description: 'Возвращает информацию о конкретном типе операции.',
    })
    @ApiIdParam('Уникальный идентификатор типа операции')
    @ApiResponse({
        status: 200,
        description: 'Тип операции найден',
        type: OperationTypeResponseDto,
    })
    @ApiReadResponses()
    public async getOperationTypeById(@Param('id') operationTypeId: string): Promise<OperationTypeResponseDto> {
        const result = await this.getOperationTypeByIdUseCase.execute(operationTypeId);

        return result.operationType;
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Обновить тип операции',
        description: 'Обновляет данные существующего типа операции. Доступно администраторам и модераторам.',
    })
    @ApiIdParam('Уникальный идентификатор типа операции')
    @ApiBody({ type: UpdateOperationTypeDto })
    @ApiResponse({
        status: 200,
        description: 'Тип операции успешно обновлён',
        type: UpdateOperationTypeResponseDto,
    })
    @ApiCrudResponses()
    public async updateOperationType(
        @Param('id') operationTypeId: string,
        @Body() updateOperationTypeDto: UpdateOperationTypeDto,
        @CurrentUserId() userId: string,
    ): Promise<UpdateOperationTypeResponseDto> {
        const result = await this.updateOperationTypeUseCase.execute(operationTypeId, updateOperationTypeDto, userId);

        return {
            message: result.message,
            operationType: result.operationType,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Удалить тип операции',
        description: 'Выполняет мягкое удаление типа операции. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор типа операции')
    @ApiResponse({
        status: 200,
        description: 'Тип операции успешно удалён',
        type: DeleteOperationTypeResponseDto,
    })
    @ApiReadResponses()
    public async deleteOperationType(
        @Param('id') operationTypeId: string,
        @CurrentUserId() userId: string,
    ): Promise<DeleteOperationTypeResponseDto> {
        const result = await this.deleteOperationTypeUseCase.execute(operationTypeId, userId);

        return {
            message: result.message,
        };
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Восстановить тип операции',
        description: 'Восстанавливает удалённый тип операции. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор типа операции')
    @ApiResponse({
        status: 200,
        description: 'Тип операции успешно восстановлен',
    })
    @ApiReadResponses()
    public async restoreOperationType(
        @Param('id') operationTypeId: string,
        @CurrentUserId() userId: string,
    ): Promise<{ message: string }> {
        return await this.restoreOperationTypeUseCase.execute(operationTypeId, userId);
    }
}
