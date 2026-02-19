import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { RoleCode } from '../../prisma/generated/prisma';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiCrudResponses, ApiIdParam, ApiTag } from '../common';
import {
    CreateLockedPeriodDto,
    CreateLockedPeriodResponseDto,
    GetLockedPeriodsResponseDto,
    OpenLockedPeriodResponseDto,
} from './dto';
import { CreateLockedPeriodUseCase, GetLockedPeriodsUseCase, OpenLockedPeriodUseCase } from './use-cases';

@ApiTag('Locked Periods', 'Блокировка создания операций')
@ApiBearerAuth('access-token')
@Controller('locked-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LockedPeriodController {
    constructor(
        private readonly getLockedPeriodsUseCase: GetLockedPeriodsUseCase,
        private readonly createLockedPeriodUseCase: CreateLockedPeriodUseCase,
        private readonly openLockedPeriodUseCase: OpenLockedPeriodUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Получить список периодов блокировки',
        description: 'Возвращает список периодов, в которых запрещено создание операций.',
    })
    @ApiResponse({
        status: 200,
        description: 'Список периодов блокировки успешно получен',
        type: GetLockedPeriodsResponseDto,
    })
    @ApiCrudResponses()
    public async getLockedPeriods(): Promise<GetLockedPeriodsResponseDto> {
        return await this.getLockedPeriodsUseCase.execute();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Создать период блокировки',
        description: 'Создаёт период, в котором запрещено создание операций.',
    })
    @ApiBody({ type: CreateLockedPeriodDto })
    @ApiResponse({
        status: 201,
        description: 'Период блокировки успешно создан',
        type: CreateLockedPeriodResponseDto,
    })
    @ApiCrudResponses()
    public async createLockedPeriod(
        @Body() createLockedPeriodDto: CreateLockedPeriodDto,
        @CurrentUserId() userId: string,
    ): Promise<CreateLockedPeriodResponseDto> {
        return await this.createLockedPeriodUseCase.execute(createLockedPeriodDto, userId);
    }

    @Patch(':id/open')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiIdParam('ID периода блокировки')
    @ApiOperation({
        summary: 'Открыть период',
        description: 'Снимает блокировку для указанного периода и разрешает создание операций.',
    })
    @ApiResponse({
        status: 200,
        description: 'Период успешно открыт',
        type: OpenLockedPeriodResponseDto,
    })
    @ApiCrudResponses()
    public async openLockedPeriod(@Param('id') id: string): Promise<OpenLockedPeriodResponseDto> {
        return await this.openLockedPeriodUseCase.execute(id);
    }
}
