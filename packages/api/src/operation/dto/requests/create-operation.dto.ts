import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import { OperationDirection } from '../../../../prisma/generated/prisma';

export class OperationEntryDto {
    @ApiProperty({
        description: 'ID кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @IsUUID('4', { message: 'ID кошелька должен быть валидным UUID' })
    public walletId: string;

    @ApiProperty({
        description: 'Направление операции',
        enum: OperationDirection,
        example: OperationDirection.credit,
    })
    @IsEnum(OperationDirection, { message: 'Неверное направление операции' })
    public direction: OperationDirection;

    @ApiProperty({ description: 'Сумма операции', example: 1000, minimum: 1 })
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(1, { message: 'Сумма должна быть больше 0' })
    public amount: number;
}

export class CreateOperationDto {
    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174100',
        format: 'uuid',
    })
    @IsUUID('4', { message: 'ID типа операции должен быть валидным UUID' })
    public typeId: string;

    @ApiProperty({ description: 'ID заявки', example: 1, required: false })
    @IsOptional()
    @IsNumber(undefined, { message: 'ID заявки должен быть числом' })
    @Min(1, { message: 'ID заявки должен быть больше 0' })
    public applicationId?: number;

    @ApiProperty({
        description: 'Описание операции',
        example: 'Перевод средств клиенту',
        maxLength: 2000,
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
    public description?: string;

    @ApiProperty({
        description: 'ID группы конверсии',
        example: 5,
        minimum: 1,
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsInt({ message: 'ID группы конверсии должен быть числом' })
    @Min(1, { message: 'ID группы конверсии должен быть больше 0' })
    public conversionGroupId?: number;

    @ApiProperty({
        description: 'Список записей операции',
        type: [OperationEntryDto],
    })
    @IsArray({ message: 'Записи операции должны быть массивом' })
    @ArrayMinSize(1, { message: 'Операция должна содержать минимум одну запись' })
    @ValidateNested({ each: true })
    @Type(() => OperationEntryDto)
    public entries: OperationEntryDto[];

    @ApiProperty({
        description: 'Дата создания',
        example: '2024-12-25T15:30:00.000Z',
        required: true,
    })
    @IsDateString({}, { message: 'Дата создания должна быть валидной датой' })
    public creatureDate: string;

    @ApiProperty({
        description: 'ID группы банков',
        example: '123e4567-e89b-12d3-a456-426614174200',
        format: 'uuid',
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID группы банков должен быть валидным UUID' })
    public banksGroupId?: string;
}
