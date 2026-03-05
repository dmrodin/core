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
    CreateCurrencyDto,
    CreateCurrencyResponseDto,
    CurrencyResponseDto,
    DeleteCurrencyResponseDto,
    GetCurrenciesDto,
    GetCurrenciesResponseDto,
    RestoreCurrencyResponseDto,
    UpdateCurrencyDto,
    UpdateCurrencyResponseDto,
} from './dto';
import {
    CreateCurrencyUseCase,
    DeleteCurrencyUseCase,
    GetCurrenciesUseCase,
    GetCurrencyByIdUseCase,
    RestoreCurrencyUseCase,
    UpdateCurrencyUseCase,
} from './use-cases';

@ApiTag('Currencies', 'Управление валютами')
@ApiBearerAuth('access-token')
@Controller('currencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CurrencyController {
    constructor(
        private readonly createCurrencyUseCase: CreateCurrencyUseCase,
        private readonly getCurrencyByIdUseCase: GetCurrencyByIdUseCase,
        private readonly getCurrenciesUseCase: GetCurrenciesUseCase,
        private readonly updateCurrencyUseCase: UpdateCurrencyUseCase,
        private readonly deleteCurrencyUseCase: DeleteCurrencyUseCase,
        private readonly restoreCurrencyUseCase: RestoreCurrencyUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Создать новую валюту',
        description: 'Создаёт новую валюту. Доступно администраторам и модераторам.',
    })
    @ApiBody({ type: CreateCurrencyDto })
    @ApiResponse({
        status: 201,
        description: 'Валюта успешно создана',
        type: CreateCurrencyResponseDto,
    })
    @ApiCrudResponses()
    public async createCurrency(
        @Body() createCurrencyDto: CreateCurrencyDto,
        @CurrentUserId() userId: string,
    ): Promise<CreateCurrencyResponseDto> {
        const result = await this.createCurrencyUseCase.execute(createCurrencyDto, userId);

        return {
            message: result.message,
            currency: result.currency,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить список валют',
        description: 'Возвращает список валют с поддержкой фильтрации, поиска и пагинации.',
    })
    @ApiListParams('Фильтры, поиск и пагинация для списка валют')
    @ApiResponse({
        status: 200,
        description: 'Список валют успешно получен',
        type: GetCurrenciesResponseDto,
    })
    @ApiReadResponses()
    public async getCurrencies(@Query() getCurrenciesDto: GetCurrenciesDto): Promise<GetCurrenciesResponseDto> {
        const result = await this.getCurrenciesUseCase.execute(getCurrenciesDto);

        return {
            currencies: result.currencies,
            pagination: result.pagination,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Получить валюту по ID',
        description: 'Возвращает информацию о конкретной валюте.',
    })
    @ApiIdParam('Уникальный идентификатор валюты')
    @ApiResponse({
        status: 200,
        description: 'Валюта найдена',
        type: CurrencyResponseDto,
    })
    @ApiReadResponses()
    public async getCurrencyById(@Param('id') currencyId: string): Promise<CurrencyResponseDto> {
        const result = await this.getCurrencyByIdUseCase.execute(currencyId);

        return result.currency;
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator)
    @ApiOperation({
        summary: 'Обновить валюту',
        description: 'Обновляет данные валюты. Доступно администраторам и модераторам.',
    })
    @ApiIdParam('Уникальный идентификатор валюты')
    @ApiBody({ type: UpdateCurrencyDto })
    @ApiResponse({
        status: 200,
        description: 'Валюта успешно обновлена',
        type: UpdateCurrencyResponseDto,
    })
    @ApiCrudResponses()
    public async updateCurrency(
        @Param('id') currencyId: string,
        @Body() updateCurrencyDto: UpdateCurrencyDto,
        @CurrentUserId() userId: string,
    ): Promise<UpdateCurrencyResponseDto> {
        const result = await this.updateCurrencyUseCase.execute(currencyId, updateCurrencyDto, userId);

        return {
            message: result.message,
            currency: result.currency,
        };
    }

    @Put(':id/restore')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Восстановить валюту',
        description: 'Восстанавливает удалённую валюту. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор валюты')
    @ApiResponse({
        status: 200,
        description: 'Валюта успешно восстановлена',
        type: RestoreCurrencyResponseDto,
    })
    @ApiReadResponses()
    public async restoreCurrency(
        @Param('id') currencyId: string,
        @CurrentUserId() userId: string,
    ): Promise<RestoreCurrencyResponseDto> {
        const result = await this.restoreCurrencyUseCase.execute(currencyId, userId);

        return {
            message: result.message,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Удалить валюту',
        description: 'Выполняет мягкое удаление валюты. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор валюты')
    @ApiResponse({
        status: 200,
        description: 'Валюта успешно удалена',
        type: DeleteCurrencyResponseDto,
    })
    @ApiReadResponses()
    public async deleteCurrency(
        @Param('id') currencyId: string,
        @CurrentUserId() userId: string,
    ): Promise<DeleteCurrencyResponseDto> {
        const result = await this.deleteCurrencyUseCase.execute(currencyId, userId);

        return {
            message: result.message,
        };
    }
}
