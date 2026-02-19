import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { BalanceStatus, WalletKind } from '../../../../prisma/generated/prisma';

export class UpdateWalletDetailsDto {
    @ApiProperty({ description: 'Телефон', example: '+79991234567', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    public phone?: string;

    @ApiProperty({ description: 'Номер карты', example: '1234 5678 9012 3456', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    public card?: string;

    @ApiProperty({ description: 'ФИО владельца', example: 'Иван Иванов', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    public ownerFullName?: string;

    @ApiProperty({ description: 'РђРґСЂРµСЃ', example: 'Moscow Russia', required: false })
    @IsOptional()
    @IsString()
    public address?: string;

    @ApiProperty({ description: 'ID банка', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public bankId?: string;

    @ApiProperty({ description: 'ID СЃРµС‚Рё', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public networkId?: string;

    @ApiProperty({ description: 'ID С‚РёРїР° СЃРµС‚Рё', example: 'uuid', required: false })
    @IsOptional()
    @IsUUID('4')
    public networkTypeId?: string;
}

export class UpdateWalletDto {
    @ApiProperty({
        description: 'РќР°Р·РІР°РЅРёРµ РєРѕС€РµР»СЊРєР°',
        example: 'РћСЃРЅРѕРІРЅРѕР№ РєРѕС€РµР»РµРє',
        maxLength: 255,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'РќР°Р·РІР°РЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ СЃС‚СЂРѕРєРѕР№' })
    @MaxLength(255, { message: 'РќР°Р·РІР°РЅРёРµ РЅРµ РґРѕР»Р¶РЅРѕ РїСЂРµРІС‹С€Р°С‚СЊ 255 СЃРёРјРІРѕР»РѕРІ' })
    public name?: string;

    @ApiProperty({
        description: 'РћРїРёСЃР°РЅРёРµ РєРѕС€РµР»СЊРєР°',
        example: 'РћСЃРЅРѕРІРЅРѕР№ РєРѕС€РµР»РµРє РґР»СЏ С…СЂР°РЅРµРЅРёСЏ СЃСЂРµРґСЃС‚РІ',
        maxLength: 2000,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'РћРїРёСЃР°РЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ СЃС‚СЂРѕРєРѕР№' })
    @MaxLength(2000, { message: 'РћРїРёСЃР°РЅРёРµ РЅРµ РґРѕР»Р¶РЅРѕ РїСЂРµРІС‹С€Р°С‚СЊ 2000 СЃРёРјРІРѕР»РѕРІ' })
    public description?: string;

    @ApiProperty({
        description: 'РЎСѓРјРјР° РІ РєРѕС€РµР»СЊРєРµ',
        example: 10000,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'РЎСѓРјРјР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј' })
    @Min(0, { message: 'РЎСѓРјРјР° РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅРѕР№' })
    public amount?: number;

    @ApiProperty({
        description: 'РЎС‚Р°С‚СѓСЃ Р±Р°Р»Р°РЅСЃР°',
        enum: BalanceStatus,
        example: BalanceStatus.positive,
        required: false,
    })
    @IsOptional()
    @IsEnum(BalanceStatus, { message: 'РќРµРІРµСЂРЅС‹Р№ СЃС‚Р°С‚СѓСЃ Р±Р°Р»Р°РЅСЃР°' })
    public balanceStatus?: BalanceStatus;

    @ApiProperty({
        description: 'РўРёРї РєРѕС€РµР»СЊРєР°',
        enum: WalletKind,
        example: WalletKind.simple,
        required: false,
    })
    @IsOptional()
    @IsEnum(WalletKind, { message: 'РќРµРІРµСЂРЅС‹Р№ С‚РёРї РєРѕС€РµР»СЊРєР°' })
    public walletKind?: WalletKind;

    @ApiProperty({
        description: 'ID С‚РёРїР° РєРѕС€РµР»СЊРєР°',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID С‚РёРїР° РєРѕС€РµР»СЊРєР° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public walletTypeId?: string;

    @ApiProperty({
        description: 'ID РІР°Р»СЋС‚С‹',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID РІР°Р»СЋС‚С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public currencyId?: string;

    @ApiProperty({
        description: 'ID РІС‚РѕСЂРѕРіРѕ РІР»Р°РґРµР»СЊС†Р° РєРѕС€РµР»СЊРєР°',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID РІС‚РѕСЂРѕРіРѕ РІР»Р°РґРµР»СЊС†Р° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРЅС‹Рј UUID' })
    public secondUserId?: string;

    @ApiProperty({
        description: 'РђРєС‚РёРІРµРЅ Р»Рё РєРѕС€РµР»РµРє',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'РђРєС‚РёРІРЅРѕСЃС‚СЊ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public active?: boolean;

    @ApiProperty({
        description: 'Р—Р°РєСЂРµРїРёС‚СЊ РЅР° РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Р—Р°РєСЂРµРїР»РµРЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public pinOnMain?: boolean;

    @ApiProperty({
        description: 'Р—Р°РєСЂРµРїР»РµРЅ Р»Рё РєРѕС€РµР»РµРє',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Р—Р°РєСЂРµРїР»РµРЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public pinned?: boolean;

    @ApiProperty({
        description: 'Р’РёРґРёРј Р»Рё РєРѕС€РµР»РµРє',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Р’РёРґРёРјРѕСЃС‚СЊ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public visible?: boolean;

    @ApiProperty({
        description: 'РњРµСЃСЏС‡РЅС‹Р№ Р»РёРјРёС‚ РѕРїРµСЂР°С†РёР№',
        example: 100000,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'РњРµСЃСЏС‡РЅС‹Р№ Р»РёРјРёС‚ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј' })
    @Min(0, { message: 'РњРµСЃСЏС‡РЅС‹Р№ Р»РёРјРёС‚ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅС‹Рј' })
    public monthlyLimit?: number;

    @ApiProperty({
        description: 'РЈРґР°Р»РµРЅ Р»Рё РєРѕС€РµР»РµРє',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'РЈРґР°Р»РµРЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±СѓР»РµРІС‹Рј Р·РЅР°С‡РµРЅРёРµРј' })
    public deleted?: boolean;

    @ApiProperty({ description: 'Р”РµС‚Р°Р»Рё РєРѕС€РµР»СЊРєР°', required: false })
    @IsOptional()
    public details?: UpdateWalletDetailsDto;

    @ApiProperty({
        description: 'Р”Р°С‚Р° РїРѕСЃР»РµРґРЅРµР№ СЃРІРµСЂРєРё',
        example: '2026-01-20T23:56:00.000Z',
        required: false,
    })
    @IsOptional()
    public lastReconciledAt?: Date;

    @ApiProperty({
        description: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ, РєРѕС‚РѕСЂС‹Р№ СЃРґРµР»Р°Р» СЃРІРµСЂРєСѓ',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4')
    public lastReconciledBy?: string;
}
