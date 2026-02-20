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
    CreateGuideDto,
    CreateGuideResponseDto,
    DeleteGuideResponseDto,
    GetGuidesDto,
    GetGuidesResponseDto,
    GuideResponseDto,
    UpdateGuideDto,
    UpdateGuideResponseDto,
} from './dto';
import {
    CreateGuideUseCase,
    DeleteGuideUseCase,
    GetGuideByIdUseCase,
    GetGuidesUseCase,
    UpdateGuideUseCase,
} from './use-cases';

@ApiTag('Guides', 'Управление гайдами')
@ApiBearerAuth('access-token')
@Controller('guides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuideController {
    constructor(
        private readonly createGuideUseCase: CreateGuideUseCase,
        private readonly getGuideByIdUseCase: GetGuideByIdUseCase,
        private readonly getGuidesUseCase: GetGuidesUseCase,
        private readonly updateGuideUseCase: UpdateGuideUseCase,
        private readonly deleteGuideUseCase: DeleteGuideUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Создать новый гайд',
        description: 'Создаёт новый гайд в системе. Доступно только администраторам.',
    })
    @ApiBody({ type: CreateGuideDto })
    @ApiResponse({
        status: 201,
        description: 'Гайд успешно создан',
        type: CreateGuideResponseDto,
    })
    @ApiCrudResponses()
    public async createGuide(
        @Body() createGuideDto: CreateGuideDto,
        @CurrentUserId() userId: string,
    ): Promise<CreateGuideResponseDto> {
        const result = await this.createGuideUseCase.execute(createGuideDto, userId);

        return {
            message: result.message,
            guide: result.guide,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить список гайдов',
        description:
            'Возвращает список гайдов с поддержкой точного поиска по полям и пагинации. Доступно только администраторам.',
    })
    @ApiListParams('Точный поиск по полям гайда')
    @ApiResponse({
        status: 200,
        description: 'Список гайдов успешно получен',
        type: GetGuidesResponseDto,
    })
    @ApiReadResponses()
    public async getGuides(@Query() getGuidesDto: GetGuidesDto): Promise<GetGuidesResponseDto> {
        const result = await this.getGuidesUseCase.execute(getGuidesDto);

        return {
            guides: result.guides,
            pagination: result.pagination,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить гайд по ID',
        description: 'Возвращает информацию о конкретном гайде. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор гайда')
    @ApiResponse({
        status: 200,
        description: 'Гайд найден',
        type: GuideResponseDto,
    })
    @ApiReadResponses()
    public async getGuideById(@Param('id') guideId: string): Promise<GuideResponseDto> {
        const result = await this.getGuideByIdUseCase.execute(guideId);

        return result.guide;
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Обновить гайд',
        description: 'Обновляет данные существующего гайда. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор гайда')
    @ApiBody({ type: UpdateGuideDto })
    @ApiResponse({
        status: 200,
        description: 'Гайд успешно обновлён',
        type: UpdateGuideResponseDto,
    })
    @ApiCrudResponses()
    public async updateGuide(
        @Param('id') guideId: string,
        @Body() updateGuideDto: UpdateGuideDto,
        @CurrentUserId() userId: string,
    ): Promise<UpdateGuideResponseDto> {
        const result = await this.updateGuideUseCase.execute(guideId, updateGuideDto, userId);

        return {
            message: result.message,
            guide: result.guide,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Удалить гайд',
        description: 'Выполняет мягкое удаление гайда из системы. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор гайда')
    @ApiResponse({
        status: 200,
        description: 'Гайд успешно удалён',
        type: DeleteGuideResponseDto,
    })
    @ApiReadResponses()
    public async deleteGuide(
        @Param('id') guideId: string,
        @CurrentUserId() userId: string,
    ): Promise<DeleteGuideResponseDto> {
        const result = await this.deleteGuideUseCase.execute(guideId, userId);

        return {
            message: result.message,
        };
    }
}
