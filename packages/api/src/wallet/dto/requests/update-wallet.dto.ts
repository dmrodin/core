import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { BalanceStatus, WalletKind } from '../../../../prisma/generated/prisma';

export class UpdateWalletDetailsDto {
    @ApiProperty({ description: '�������', example: '+79991234567', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    public phone?: string;

    @ApiProperty({ description: '����� �����', example: '1234 5678 9012 3456', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    public card?: string;

    @ApiProperty({ description: '��� ���������', example: '���� ������', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    public ownerFullName?: string;

    @ApiProperty({ description: 'Адрес', example: 'Moscow Russia', required: false })
    @IsOptional()
    @IsString()
    public address?: string;

    @ApiProperty({ description: 'ID �����', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public bankId?: string;

    @ApiProperty({ description: 'ID сети', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public networkId?: string;

    @ApiProperty({ description: 'ID типа сети', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public networkTypeId?: string;

    @ApiProperty({ description: 'ID ���������', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public platformId?: string;
}

export class UpdateWalletDto {
    @ApiProperty({
        description: 'Название кошелька',
        example: 'Основной кошелек',
        maxLength: 255,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Название должно быть строкой' })
    @MaxLength(255, { message: 'Название не должно превышать 255 символов' })
    public name?: string;

    @ApiProperty({
        description: 'Описание кошелька',
        example: 'Основной кошелек для хранения средств',
        maxLength: 2000,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
    public description?: string;

    @ApiProperty({
        description: 'Сумма в кошельке',
        example: 10000,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(0, { message: 'Сумма не может быть отрицательной' })
    public amount?: number;

    @ApiProperty({
        description: 'Статус баланса',
        enum: BalanceStatus,
        example: BalanceStatus.positive,
        required: false,
    })
    @IsOptional()
    @IsEnum(BalanceStatus, { message: 'Неверный статус баланса' })
    public balanceStatus?: BalanceStatus;

    @ApiProperty({
        description: 'Тип кошелька',
        enum: WalletKind,
        example: WalletKind.simple,
        required: false,
    })
    @IsOptional()
    @IsEnum(WalletKind, { message: 'Неверный тип кошелька' })
    public walletKind?: WalletKind;

    @ApiProperty({
        description: 'ID типа кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID типа кошелька должен быть валидным UUID' })
    public walletTypeId?: string;

    @ApiProperty({
        description: 'ID валюты',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID валюты должен быть валидным UUID' })
    public currencyId?: string;

    @ApiProperty({
        description: 'ID второго владельца кошелька',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID второго владельца должен быть валидным UUID' })
    public secondUserId?: string;

    @ApiProperty({
        description: 'Активен ли кошелек',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Активность должна быть булевым значением' })
    public active?: boolean;

    @ApiProperty({
        description: 'Закрепить на главной странице',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Закрепление должно быть булевым значением' })
    public pinOnMain?: boolean;

    @ApiProperty({
        description: 'Закреплен ли кошелек',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Закрепление должно быть булевым значением' })
    public pinned?: boolean;

    @ApiProperty({
        description: 'Видим ли кошелек',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Видимость должна быть булевым значением' })
    public visible?: boolean;

    @ApiProperty({
        description: 'Месячный лимит операций',
        example: 100000,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'Месячный лимит должен быть целым числом' })
    @Min(0, { message: 'Месячный лимит не может быть отрицательным' })
    public monthlyLimit?: number;

    @ApiProperty({
        description: 'Удален ли кошелек',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Удаление должно быть булевым значением' })
    public deleted?: boolean;

    @ApiProperty({ description: 'Детали кошелька', required: false })
    @IsOptional()
    public details?: UpdateWalletDetailsDto;

    @ApiProperty({
        description: 'Дата последней сверки',
        example: '2026-01-20T23:56:00.000Z',
        required: false,
    })
    @IsOptional()
    public lastReconciledAt?: Date;

    @ApiProperty({
        description: 'Пользователь, который сделал сверку',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4')
    public lastReconciledBy?: string;
}
