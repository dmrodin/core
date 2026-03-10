import { ApiProperty } from '@nestjs/swagger';

import { ApplicationStatus } from '../../../../prisma/generated/prisma';

export class UserInfoDto {
    @ApiProperty({
        description: 'ID пользователя',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({ description: 'Имя пользователя', example: 'john_doe' })
    public username: string;
}

export class CurrencyInfoDto {
    @ApiProperty({
        description: 'ID валюты',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({ description: 'Название валюты', example: 'Доллар США' })
    public name: string;

    @ApiProperty({ description: 'Код валюты', example: 'USD' })
    public code: string;
}

export class OperationTypeInfoDto {
    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({
        description: 'Название типа операции',
        example: 'Обмен валют',
    })
    public name: string;
}

export class OperationInfoDto {
    @ApiProperty({
        description: 'ID операции',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({
        description: 'Описание операции',
        example: 'Описание операции',
        nullable: true,
    })
    public description: string | null;
}

export class ApplicationResponseDto {
    @ApiProperty({ description: 'ID заявки', example: 1 })
    public id: number;

    @ApiProperty({
        description: 'Описание заявки',
        example: 'Обмен долларов на рубли по выгодному курсу',
        nullable: true,
    })
    public description: string | null;

    @ApiProperty({
        description: 'Статус заявки',
        enum: ApplicationStatus,
        example: ApplicationStatus.open,
    })
    public status: ApplicationStatus;

    @ApiProperty({ description: 'Сумма заявки', example: 5000 })
    public amount: number;

    @ApiProperty({
        description: 'ID валюты',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public currencyId: string;

    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public operationTypeId: string;

    @ApiProperty({
        description: 'ID операции',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
    })
    public operationId: string | null;

    @ApiProperty({
        description: 'ID создателя',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public userId: string;

    @ApiProperty({
        description: 'ID исполнителя',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public assigneeUserId: string;

    @ApiProperty({
        description: 'ID обновившего',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
    })
    public updatedById: string | null;

    @ApiProperty({ description: 'Информация о создателе', type: UserInfoDto })
    public created_by: UserInfoDto;

    @ApiProperty({
        description: 'Информация об обновившем',
        type: UserInfoDto,
        nullable: true,
    })
    public updated_by: UserInfoDto | null;

    @ApiProperty({ description: 'Информация об исполнителе', type: UserInfoDto })
    public assignee_user: UserInfoDto;

    @ApiProperty({ description: 'Информация о валюте', type: CurrencyInfoDto })
    public currency: CurrencyInfoDto;

    @ApiProperty({
        description: 'Информация о типе операции',
        type: OperationTypeInfoDto,
    })
    public operation_type: OperationTypeInfoDto;

    @ApiProperty({
        description: 'Информация об операции',
        type: OperationInfoDto,
        nullable: true,
    })
    public operation: OperationInfoDto | null;

    @ApiProperty({
        description: 'Telegram username',
        example: 'username',
        nullable: true,
    })
    public telegramUsername: string | null;

    @ApiProperty({
        description: 'Номер телефона',
        example: '+7 (999) 123-45-67',
        nullable: true,
    })
    public phone: string | null;

    @ApiProperty({
        description: 'Дата встречи',
        example: '2024-12-25T15:30:00.000Z',
    })
    public meetingDate: Date;

    @ApiProperty({
        description: 'Наличие аванса',
        example: false,
    })
    public hasAdvance: boolean;

    @ApiProperty({
        description: 'Дата создания',
        example: '2024-01-01T00:00:00.000Z',
    })
    public createdAt: Date;

    @ApiProperty({
        description: 'Дата обновления',
        example: '2024-01-01T00:00:00.000Z',
    })
    public updatedAt: Date;

    @ApiProperty({
        description: 'Аванс по заявке',
        nullable: true,
        example: {
            amount: 1000,
            currency: 'USD',
        },
    })
    public advance: {
        amount: number;
        currency: string;
    } | null;

    @ApiProperty({
        description: 'Проводки аванса',
        nullable: true,
        example: [
            { walletId: '123e4567-e89b-12d3-a456-426614174000', direction: 'debit', amount: 50 },
            { walletId: '123e4567-e89b-12d3-a456-426614174000', direction: 'credit', amount: 50 },
        ],
    })
    public advanceEntries: {
        walletId: string;
        direction: 'debit' | 'credit';
        amount: number;
    }[] | null;
}
