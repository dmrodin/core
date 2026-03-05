import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
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
    BlockUserDto,
    BlockUserResponseDto,
    DeleteUserResponseDto,
    GetUsersDto,
    GetUsersResponseDto,
    UpdateUserDto,
    UpdateUserResponseDto,
    UpdateUserRolesDto,
    UpdateUserRolesResponseDto,
    UserResponseDto,
} from './dto';
import {
    BlockUserUseCase,
    DeleteUserUseCase,
    GetUserByIdUseCase,
    GetUsersUseCase,
    UpdateUserRolesUseCase,
    UpdateUserUseCase,
} from './use-cases';

@ApiTag('Users', 'Управление пользователями')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly updateUserRolesUseCase: UpdateUserRolesUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly blockUserUseCase: BlockUserUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({
        summary: 'Получить список пользователей',
        description:
            'Возвращает список пользователей с поддержкой фильтрации и пагинации. Доступно только администраторам.',
    })
    @ApiListParams('Фильтрация и поиск пользователей')
    @ApiResponse({
        status: 200,
        description: 'Список пользователей успешно получен',
        type: GetUsersResponseDto,
    })
    @ApiReadResponses()
    public async getUsers(@Query() getUsersDto: GetUsersDto): Promise<GetUsersResponseDto> {
        const result = await this.getUsersUseCase.execute(getUsersDto);

        return {
            users: result.users,
            pagination: result.pagination,
        };
    }

    @Put(':id/roles')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Обновить роли пользователя',
        description: 'Заменяет список ролей пользователя на указанный. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор пользователя')
    @ApiBody({ type: UpdateUserRolesDto })
    @ApiResponse({
        status: 200,
        description: 'Роли пользователя успешно обновлены',
        type: UpdateUserRolesResponseDto,
    })
    @ApiCrudResponses()
    public async updateUserRoles(
        @Param('id') userId: string,
        @Body() updateUserRolesDto: UpdateUserRolesDto,
    ): Promise<UpdateUserRolesResponseDto> {
        const result = await this.updateUserRolesUseCase.execute(userId, updateUserRolesDto.roleCodes);

        return {
            message: result.message,
            user: result.user,
        };
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Получить текущего пользователя',
        description: 'Возвращает профиль текущего пользователя.',
    })
    @ApiResponse({
        status: 200,
        description: 'Профиль пользователя успешно получен',
        type: UserResponseDto,
    })
    @ApiReadResponses()
    public async getCurrentUser(@CurrentUserId() userId: string): Promise<UserResponseDto> {
        const result = await this.getUserByIdUseCase.execute(userId);

        return result.user;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Получить пользователя по ID',
        description: 'Возвращает информацию о конкретном пользователе. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор пользователя')
    @ApiResponse({
        status: 200,
        description: 'Пользователь найден',
        type: UserResponseDto,
    })
    @ApiReadResponses()
    public async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
        const result = await this.getUserByIdUseCase.execute(userId);

        return result.user;
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Обновить пользователя',
        description: 'Обновляет данные существующего пользователя. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор пользователя')
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'Пользователь успешно обновлен',
        type: UpdateUserResponseDto,
    })
    @ApiCrudResponses()
    public async updateUser(
        @Param('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UpdateUserResponseDto> {
        const result = await this.updateUserUseCase.execute(userId, updateUserDto);

        return {
            message: result.message,
            user: result.user,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Частично обновить пользователя',
        description: 'Частично обновляет данные существующего пользователя. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор пользователя')
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'Пользователь успешно обновлен',
        type: UpdateUserResponseDto,
    })
    @ApiCrudResponses()
    public async patchUser(
        @Param('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UpdateUserResponseDto> {
        const result = await this.updateUserUseCase.execute(userId, updateUserDto);

        return {
            message: result.message,
            user: result.user,
        };
    }

    @Put(':id/block')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Заблокировать/разблокировать пользователя',
        description: 'Изменяет статус блокировки пользователя. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор пользователя')
    @ApiBody({ type: BlockUserDto })
    @ApiResponse({
        status: 200,
        description: 'Статус блокировки успешно изменен',
        type: BlockUserResponseDto,
    })
    @ApiCrudResponses()
    public async blockUser(
        @Param('id') userId: string,
        @Body() blockUserDto: BlockUserDto,
    ): Promise<BlockUserResponseDto> {
        const result = await this.blockUserUseCase.execute(userId, blockUserDto);

        return {
            message: result.message,
            user: result.user,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({
        summary: 'Удалить пользователя',
        description: 'Выполняет мягкое удаление пользователя из системы. Доступно только администраторам.',
    })
    @ApiIdParam('Уникальный идентификатор пользователя')
    @ApiResponse({
        status: 200,
        description: 'Пользователь успешно удален',
        type: DeleteUserResponseDto,
    })
    @ApiReadResponses()
    public async deleteUser(@Param('id') userId: string): Promise<DeleteUserResponseDto> {
        const result = await this.deleteUserUseCase.execute(userId);

        return {
            message: result.message,
        };
    }
}
