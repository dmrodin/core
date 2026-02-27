import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

// import { CreateOperationDto } from 'src/operation/dto/requests/create-operation.dto';
// import { CreateOperationUseCase } from 'src/operation/use-cases/create-operation.use-case';
import { RoleCode } from '../../prisma/generated/prisma';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiCrudResponses, ApiIdParam, ApiListParams, ApiReadResponses, ApiTag } from '../common';
import {
    ApplicationResponseDto,
    CreateApplicationDto,
    CreateApplicationResponseDto,
    DeleteApplicationResponseDto,
    GetApplicationsDto,
    GetApplicationsResponseDto,
    UpdateApplicationDto,
    UpdateApplicationResponseDto,
} from './dto';
import {
    CreateApplicationUseCase,
    DeleteApplicationUseCase,
    GetApplicationByIdUseCase,
    GetApplicationsUseCase,
    UpdateApplicationUseCase,
} from './use-cases';

@ApiTag('Applications', 'Управление заявками')
@ApiBearerAuth('access-token')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
    constructor(
        private readonly createApplicationUseCase: CreateApplicationUseCase,
        private readonly getApplicationsUseCase: GetApplicationsUseCase,
        private readonly getApplicationByIdUseCase: GetApplicationByIdUseCase,
        private readonly updateApplicationUseCase: UpdateApplicationUseCase,
        private readonly deleteApplicationUseCase: DeleteApplicationUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить список заявок',
        description:
            'Возвращает список заявок с поддержкой точного поиска по полям и пагинации. Доступно только администраторам.',
    })
    @ApiListParams('Точный поиск по полям заявки')
    @ApiResponse({
        status: 200,
        description: 'Список заявок успешно получен',
        type: GetApplicationsResponseDto,
    })
    @ApiReadResponses()
    public async getApplications(@Query() getApplicationsDto: GetApplicationsDto): Promise<GetApplicationsResponseDto> {
        const result = await this.getApplicationsUseCase.execute(getApplicationsDto);

        return {
            applications: result.applications,
            pagination: result.pagination,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить заявку по ID',
        description: 'Возвращает информацию о конкретной заявке. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор заявки')
    @ApiResponse({
        status: 200,
        description: 'Заявка найдена',
        type: ApplicationResponseDto,
    })
    @ApiReadResponses()
    public async getApplicationById(@Param('id', ParseIntPipe) applicationId: number): Promise<ApplicationResponseDto> {
        const result = await this.getApplicationByIdUseCase.execute(applicationId);

        return result.application;
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Создать новую заявку',
        description: 'Создаёт новую заявку в системе. Доступно только администраторам.',
    })
    @ApiBody({ type: CreateApplicationDto })
    @ApiResponse({
        status: 201,
        description: 'Заявка успешно создана',
        type: CreateApplicationResponseDto,
    })
    @ApiCrudResponses()
    public async createApplication(
        @Body() createApplicationDto: CreateApplicationDto,
        @CurrentUserId() userId: string,
    ): Promise<CreateApplicationResponseDto> {
        const result = await this.createApplicationUseCase.execute(createApplicationDto, userId);

        /* if (createApplicationDto.advance && createApplicationDto.advance.amount > 0) {
            const operationDto: CreateOperationDto = {
                typeId: createApplicationDto.operationTypeId,
                applicationId: result.application.id,
                creatureDate: new Date().toISOString(),
                description: `Аванс по заявке №${result.application.id}`,
                entries: [
                    {
                        amount: createApplicationDto.advance.amount,
                        direction: OperationDirection.credit,
                        walletId: '',
                    },
                ],
            };

            await this.createOperationUseCase.execute(operationDto, userId);
        } */

        return {
            message: result.message,
            application: result.application,
        };
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Обновить заявку',
        description: 'Обновляет данные существующей заявки. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор заявки')
    @ApiBody({ type: UpdateApplicationDto })
    @ApiResponse({
        status: 200,
        description: 'Заявка успешно обновлена',
        type: UpdateApplicationResponseDto,
    })
    @ApiCrudResponses()
    public async updateApplication(
        @Param('id', ParseIntPipe) applicationId: number,
        @Body() updateApplicationDto: UpdateApplicationDto,
        @CurrentUserId() userId: string,
    ): Promise<UpdateApplicationResponseDto> {
        const result = await this.updateApplicationUseCase.execute(applicationId, updateApplicationDto, userId);

        return {
            message: result.message,
            application: result.application,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Удалить заявку',
        description: 'Выполняет мягкое удаление заявки из системы. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор заявки')
    @ApiResponse({
        status: 200,
        description: 'Заявка успешно удалена',
        type: DeleteApplicationResponseDto,
    })
    @ApiReadResponses()
    public async deleteApplication(
        @Param('id', ParseIntPipe) applicationId: number,
        @CurrentUserId() userId: string,
    ): Promise<DeleteApplicationResponseDto> {
        const result = await this.deleteApplicationUseCase.execute(applicationId, userId);

        return {
            message: result.message,
        };
    }
}
