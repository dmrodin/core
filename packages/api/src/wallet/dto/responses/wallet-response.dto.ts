import { ApiProperty } from '@nestjs/swagger';

import { BalanceStatus, WalletKind } from '../../../../prisma/generated/prisma';

export class WalletTypeDto {
    @ApiProperty({ description: 'ID типа кошелька' })
    public id: string;

    @ApiProperty({ description: 'Код типа', example: 'inskech' })
    public code: string;

    @ApiProperty({ description: 'Название типа', example: 'Инскеш' })
    public name: string;

    @ApiProperty({ description: 'Описание', required: false })
    public description?: string | null;

    @ApiProperty({ description: 'Показывать в табах', example: true })
    public showInTabs: boolean;

    @ApiProperty({ description: 'Порядок в табах', example: 1 })
    public tabOrder: number;

    @ApiProperty({ description: 'Цвет', required: false })
    public color?: string | null;

    @ApiProperty({ description: 'Иконка', required: false })
    public icon?: string | null;
}

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

export class NetworkInfoDto {
    @ApiProperty({
        description: 'ID сети',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({ description: 'Код сети', example: 'TRON' })
    public code: string;

    @ApiProperty({ description: 'Название сети', example: 'Tron' })
    public name: string;
}

export class NetworkTypeInfoDto {
    @ApiProperty({
        description: 'ID типа сети',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({ description: 'Код типа сети', example: 'TRC20' })
    public code: string;

    @ApiProperty({ description: 'Название типа сети', example: 'TRC-20' })
    public name: string;
}

export class WalletDetailInfoDto {
    @ApiProperty({
        description: 'ID деталей кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({
        description: 'Номер телефона',
        example: '+7 (999) 123-45-67',
        nullable: true,
    })
    public phone: string | null;

    @ApiProperty({
        description: 'Номер карты',
        example: '1234 5678 9012 3456',
        nullable: true,
    })
    public card: string | null;

    @ApiProperty({
        description: 'Полное имя владельца',
        example: 'Иван Иванов',
        nullable: true,
    })
    public ownerFullName: string | null;

    @ApiProperty({
        description: 'Адрес кошелька',
        example: '0x1234567890abcdef',
        nullable: true,
    })
    public address: string | null;

    @ApiProperty({
        description: 'ID аккаунта',
        example: 'account123',
        nullable: true,
    })
    public accountId: string | null;

    @ApiProperty({
        description: 'Имя пользователя',
        example: 'username',
        nullable: true,
    })
    public username: string | null;

    @ApiProperty({
        description: 'UID биржи',
        example: 'exchange_uid_123',
        nullable: true,
    })
    public exchangeUid: string | null;

    @ApiProperty({
        description: 'Сеть кошелька',
        type: NetworkInfoDto,
        nullable: true,
    })
    public network: NetworkInfoDto | null;

    @ApiProperty({
        description: 'Тип сети кошелька',
        type: NetworkTypeInfoDto,
        nullable: true,
    })
    public networkType: NetworkTypeInfoDto | null;
}

export class WalletResponseDto {
    @ApiProperty({
        description: 'ID кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({
        description: 'ID пользователя',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public userId: string;

    @ApiProperty({
        description: 'ID обновившего',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public updatedById: string;

    @ApiProperty({
        description: 'ID валюты',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public currencyId: string;

    @ApiProperty({
        description: 'Название кошелька',
        example: 'Основной кошелек',
        nullable: true,
    })
    public name: string | null;

    @ApiProperty({
        description: 'Описание кошелька',
        example: 'Основной кошелек для хранения средств',
        nullable: true,
    })
    public description: string | null;

    @ApiProperty({ description: 'Сумма в кошельке', example: 10000 })
    public amount: number;

    @ApiProperty({
        description: 'Статус баланса',
        enum: BalanceStatus,
        example: BalanceStatus.positive,
    })
    public balanceStatus: BalanceStatus;

    @ApiProperty({
        description: 'Тип кошелька',
        enum: WalletKind,
        example: WalletKind.simple,
    })
    public walletKind: WalletKind;

    @ApiProperty({
        description: 'Тип кошелька',
        type: () => WalletTypeDto,
        nullable: true,
    })
    public walletType: WalletTypeDto | null;

    @ApiProperty({ description: 'Активен ли кошелек', example: true })
    public active: boolean;

    @ApiProperty({ description: 'Закреплен на главной', example: false })
    public pinOnMain: boolean;

    @ApiProperty({ description: 'Закреплен ли кошелек', example: false })
    public pinned: boolean;

    @ApiProperty({ description: 'Кошелек в личном быстром доступе текущего пользователя', example: false })
    public isFastAccessByCurrentUser: boolean;

    @ApiProperty({ description: 'Видим ли кошелек', example: true })
    public visible: boolean;

    @ApiProperty({ description: 'Удален ли кошелек', example: false })
    public deleted: boolean;

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

    @ApiProperty({ description: 'Информация о создателе', type: UserInfoDto })
    public created_by: UserInfoDto;

    @ApiProperty({ description: 'Информация об обновившем', type: UserInfoDto })
    public updated_by: UserInfoDto;

    @ApiProperty({ description: 'Кто сделал последнюю сверку', type: UserInfoDto, nullable: true })
    public lastReconciled_by: UserInfoDto | null;

    @ApiProperty({ description: 'Информация о валюте', type: CurrencyInfoDto })
    public currency: CurrencyInfoDto;

    @ApiProperty({
        description: 'Детали кошелька',
        type: WalletDetailInfoDto,
        nullable: true,
    })
    public details: WalletDetailInfoDto | null;
}
