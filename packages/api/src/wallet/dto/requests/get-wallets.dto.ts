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
        description: 'РџРѕРёСЃРє РїРѕ РІСЃРµРј С‚РµРєСЃС‚РѕРІС‹Рј РїРѕР»СЏРј (name, description)',
        example: 'РћСЃРЅРѕРІРЅРѕР№ РєРѕС€РµР»РµРє',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'РџРѕРёСЃРє РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ СЃС‚СЂРѕРєРѕР№' })
    public search?: string;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ СЃС‚Р°С‚СѓСЃСѓ Р±Р°Р»Р°РЅСЃР°',
        enum: BalanceStatus,
        example: BalanceStatus.positive,
        required: false,
    })
    @IsOptional()
    @IsEnum(BalanceStatus, { message: 'РќРµРІРµСЂРЅС‹Р№ СЃС‚Р°С‚СѓСЃ Р±Р°Р»Р°РЅСЃР°' })
    public balanceStatus?: BalanceStatus;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ С‚РёРїСѓ РєРѕС€РµР»СЊРєР°',
        enum: WalletKind,
        example: WalletKind.simple,
        required: false,
    })
    @IsOptional()
    @IsEnum(WalletKind, { message: 'РќРµРІРµСЂРЅС‹Р№ С‚РёРї РєРѕС€РµР»СЊРєР°' })
    public walletKind?: WalletKind;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ ID С‚РёРїР° РєРѕС€РµР»СЊРєР°',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID С‚РёРїР° РєРѕС€РµР»СЊРєР° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public walletTypeId?: string;

    @ApiProperty({
        description: 'РњРёРЅРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° РІ РєРѕС€РµР»СЊРєРµ',
        example: 1000,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'РњРёРЅРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ С‡РёСЃР»РѕРј' })
    @Min(0, { message: 'РњРёРЅРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅРѕР№' })
    public minAmount?: number;

    @ApiProperty({
        description: 'РњР°РєСЃРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° РІ РєРѕС€РµР»СЊРєРµ',
        example: 100000,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'РњР°РєСЃРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ С‡РёСЃР»РѕРј' })
    @Min(0, { message: 'РњР°РєСЃРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅРѕР№' })
    public maxAmount?: number;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ ID РІР°Р»СЋС‚С‹',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID РІР°Р»СЋС‚С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public currencyId?: string;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ ID РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public userId?: string;
    @ApiProperty({
        description: ''Фильтр по владельцу (владелец 1 или владелец 2)'',
        example: ''123e4567-e89b-12d3-a456-426614174000'',
        required: false,
    })
    @IsOptional()
    @IsUUID(''4'', { message: ''ID владельца должен быть валидным UUID'' })
    public ownerId?: string;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ ID РІС‚РѕСЂРѕРіРѕ РІР»Р°РґРµР»СЊС†Р° РєРѕС€РµР»СЊРєР°',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID РІС‚РѕСЂРѕРіРѕ РІР»Р°РґРµР»СЊС†Р° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public secondUserId?: string;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ Р°РєС‚РёРІРЅРѕСЃС‚Рё РєРѕС€РµР»СЊРєР°',
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
    @IsBoolean({ message: 'РђРєС‚РёРІРЅРѕСЃС‚СЊ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public active?: boolean;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ Р·Р°РєСЂРµРїР»РµРЅРёСЋ РЅР° РіР»Р°РІРЅРѕР№',
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
        message: 'Р—Р°РєСЂРµРїР»РµРЅРёРµ РЅР° РіР»Р°РІРЅРѕР№ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј',
    })
    public pinOnMain?: boolean;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ Р·Р°РєСЂРµРїР»РµРЅРёСЋ',
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
    @IsBoolean({ message: 'Р—Р°РєСЂРµРїР»РµРЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public pinned?: boolean;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ РІРёРґРёРјРѕСЃС‚Рё',
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
    @IsBoolean({ message: 'Р’РёРґРёРјРѕСЃС‚СЊ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public visible?: boolean;

    @ApiProperty({
        description: 'Р¤РёР»СЊС‚СЂ РїРѕ СѓРґР°Р»РµРЅРЅС‹Рј РєРѕС€РµР»СЊРєР°Рј',
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
    @IsBoolean({ message: 'РЈРґР°Р»РµРЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public deleted?: boolean;

    @ApiProperty({
        description: 'РџРѕР»Рµ РґР»СЏ СЃРѕСЂС‚РёСЂРѕРІРєРё',
        enum: WalletSortField,
        example: WalletSortField.CREATED_AT,
        required: false,
    })
    @IsOptional()
    @IsEnum(WalletSortField, { message: 'РќРµРІРµСЂРЅРѕРµ РїРѕР»Рµ РґР»СЏ СЃРѕСЂС‚РёСЂРѕРІРєРё' })
    public sortField?: WalletSortField = WalletSortField.CREATED_AT;

    @ApiProperty({
        description: 'РџРѕСЂСЏРґРѕРє СЃРѕСЂС‚РёСЂРѕРІРєРё',
        enum: SortOrder,
        example: SortOrder.DESC,
        required: false,
    })
    @IsOptional()
    @IsEnum(SortOrder, { message: 'РќРµРІРµСЂРЅС‹Р№ РїРѕСЂСЏРґРѕРє СЃРѕСЂС‚РёСЂРѕРІРєРё' })
    public sortOrder?: SortOrder = SortOrder.DESC;

    @ApiProperty({
        description: 'РќРѕРјРµСЂ СЃС‚СЂР°РЅРёС†С‹',
        example: 1,
        minimum: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'РќРѕРјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‡РёСЃР»РѕРј' })
    @Min(1, { message: 'РќРѕРјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0' })
    public page?: number = 1;

    @ApiProperty({
        description: 'Р Р°Р·РјРµСЂ СЃС‚СЂР°РЅРёС†С‹',
        example: 10,
        minimum: 1,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Р Р°Р·РјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‡РёСЃР»РѕРј' })
    @Min(1, { message: 'Р Р°Р·РјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0' })
    @Max(100, { message: 'Р Р°Р·РјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ 100' })
    public limit?: number = 10;
}

