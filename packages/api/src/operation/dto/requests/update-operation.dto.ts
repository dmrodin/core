import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsIn,
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
import { AVAILABLE_EXPENSE_CATEGORIES } from '../../constants/expense.constants';

export class UpdateOperationEntryDto {
    @ApiProperty({
        description: 'ID записи операции',
        example: '123e4567-e89b-12d3-a456-426614174050',
        format: 'uuid',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID записи должен быть валидным UUID' })
    public id?: string;

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

    @ApiProperty({ description: 'Сумма операции', example: 2000, minimum: 1 })
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(1, { message: 'Сумма должна быть больше 0' })
    public amount: number;
}

export class UpdateOperationDto {
    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174100',
        format: 'uuid',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID типа операции должен быть валидным UUID' })
    public typeId?: string;

    @ApiProperty({
        description: 'Описание операции',
        example: 'Обновлённое описание операции',
        maxLength: 2000,
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
    public description?: string;

    @ApiProperty({
        description: 'Expense category for operation type "expense"',
        example: 'salary',
        required: false,
        nullable: true,
        enum: AVAILABLE_EXPENSE_CATEGORIES,
    })
    @IsOptional()
    @IsIn(AVAILABLE_EXPENSE_CATEGORIES, {
        message: `Invalid expense category: ${AVAILABLE_EXPENSE_CATEGORIES.join(', ')}`,
    })
    public expenseCategory?: string | null;

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
        description: 'ID заявки',
        example: 1,
        minimum: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber(undefined, { message: 'ID заявки должен быть числом' })
    @Min(1, { message: 'ID заявки должен быть больше 0' })
    public applicationId?: number;

    @ApiProperty({
        description: 'Список записей операции',
        type: [UpdateOperationEntryDto],
        required: false,
    })
    @IsOptional()
    @IsArray({ message: 'Записи операции должны быть массивом' })
    @ArrayMinSize(1, { message: 'Операция должна содержать минимум одну запись' })
    @ValidateNested({ each: true })
    @Type(() => UpdateOperationEntryDto)
    public entries?: UpdateOperationEntryDto[];

    @ApiProperty({
        description: 'Дата операции',
        example: '2024-12-25T15:30:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString({}, { message: 'Дата операции должна быть валидной датой' })
    public creatureDate?: string;

    @ApiProperty({
        description: 'ID выбранного банка',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID банка должен быть валидным UUID' })
    public banksGroupId?: string;
}
