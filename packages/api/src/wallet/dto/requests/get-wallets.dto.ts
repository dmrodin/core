import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { BalanceStatus, WalletKind } from '../../../../prisma/generated/prisma';
import { SortOrder } from '../../../common/enums';

export enum WalletSortField {
    NAME = 'name',
    AMOUNT = 'amount',
    BALANCE_STATUS = 'balanceStatus',
    WALLET_KIND = 'walletKind',
    WALLET_TYPE = 'walletType',
    ACTIVE = 'active',
    PINNED = 'pinned',
    VISIBLE = 'visible',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export class GetWalletsDto {
    @ApiProperty({
        description: 'Поиск по всем текстовым полям (name, description)',
        example: 'Основной кошелек',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Поиск должен быть строкой' })
    public search?: string;

    @ApiProperty({
        description: 'Искать только по названию кошелька',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({ message: 'Параметр searchByName должен быть булевым значением' })
    public searchByName?: boolean;

    @ApiProperty({
        description: 'Фильтр по статусу баланса',
        enum: BalanceStatus,
        example: BalanceStatus.positive,
        required: false,
    })
    @IsOptional()
    @IsEnum(BalanceStatus, { message: 'Неверный статус баланса' })
    public balanceStatus?: BalanceStatus;

    @ApiProperty({
        description: 'Фильтр по типу кошелька',
        enum: WalletKind,
        example: WalletKind.simple,
        required: false,
    })
    @IsOptional()
    @IsEnum(WalletKind, { message: 'Неверный тип кошелька' })
    public walletKind?: WalletKind;

    @ApiProperty({
        description: 'Фильтр по ID типа кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID типа кошелька должен быть валидным UUID' })
    public walletTypeId?: string;

    @ApiProperty({
        description: 'Минимальная сумма в кошельке',
        example: 1000,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Минимальная сумма должна быть числом' })
    @Min(0, { message: 'Минимальная сумма не может быть отрицательной' })
    public minAmount?: number;

    @ApiProperty({
        description: 'Максимальная сумма в кошельке',
        example: 100000,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Максимальная сумма должна быть числом' })
    @Min(0, { message: 'Максимальная сумма не может быть отрицательной' })
    public maxAmount?: number;

    @ApiProperty({
        description: 'Фильтр по ID валюты',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID валюты должен быть валидным UUID' })
    public currencyId?: string;

    @ApiProperty({
        description: 'Фильтр по ID пользователя',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID пользователя должен быть валидным UUID' })
    public userId?: string;

    @ApiProperty({
        description: 'Фильтр по ID второго владельца кошелька',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID второго владельца должен быть валидным UUID' })
    public secondUserId?: string;

    @ApiProperty({
        description: 'Фильтр по любому владельцу (userId или secondUserId)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID владельца должен быть валидным UUID' })
    public ownerId?: string;

    @ApiProperty({
        description: 'Фильтр по активности кошелька',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({ message: 'Активность должна быть булевым значением' })
    public active?: boolean;

    @ApiProperty({
        description: 'Фильтр по закреплению на главной',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({
        message: 'Закрепление на главной должно быть булевым значением',
    })
    public pinOnMain?: boolean;

    @ApiProperty({
        description: 'Фильтр по закреплению',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({ message: 'Закрепление должно быть булевым значением' })
    public pinned?: boolean;

    @ApiProperty({
        description: 'Фильтр по видимости',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({ message: 'Видимость должна быть булевым значением' })
    public visible?: boolean;

    @ApiProperty({
        description: 'Фильтр по удаленным кошелькам',
        example: false,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({ message: 'Удаление должно быть булевым значением' })
    public deleted?: boolean;

    @ApiProperty({
        description: 'Включать в выборку типы кошельков, которые отображаются в отдельных вкладках',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        return value;
    })
    @IsBoolean({ message: 'Параметр includeTabWalletTypes должен быть булевым значением' })
    public includeTabWalletTypes?: boolean;

    @ApiProperty({
        description: 'Поле для сортировки',
        enum: WalletSortField,
        example: WalletSortField.CREATED_AT,
        required: false,
    })
    @IsOptional()
    @IsEnum(WalletSortField, { message: 'Неверное поле для сортировки' })
    public sortField?: WalletSortField = WalletSortField.CREATED_AT;

    @ApiProperty({
        description: 'Порядок сортировки',
        enum: SortOrder,
        example: SortOrder.DESC,
        required: false,
    })
    @IsOptional()
    @IsEnum(SortOrder, { message: 'Неверный порядок сортировки' })
    public sortOrder?: SortOrder = SortOrder.DESC;

    @ApiProperty({
        description: 'Номер страницы',
        example: 1,
        minimum: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Номер страницы должен быть числом' })
    @Min(1, { message: 'Номер страницы должен быть больше 0' })
    public page?: number = 1;

    @ApiProperty({
        description: 'Размер страницы',
        example: 10,
        minimum: 1,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Размер страницы должен быть числом' })
    @Min(1, { message: 'Размер страницы должен быть больше 0' })
    @Max(100, { message: 'Размер страницы не должен превышать 100' })
    public limit?: number = 10;
}
