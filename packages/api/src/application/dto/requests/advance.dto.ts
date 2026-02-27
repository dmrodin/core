import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

import { OperationDirection } from '../../../../prisma/generated/prisma';

export class AdvanceEntryDto {
    @ApiProperty({
        description: 'ID кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4', { message: 'ID кошелька должен быть валидным UUID' })
    public walletId: string;

    @ApiProperty({
        description: 'Направление операции',
        enum: OperationDirection,
        example: OperationDirection.debit,
    })
    @IsEnum(OperationDirection, { message: 'Неверное направление операции' })
    public direction: OperationDirection;

    @ApiProperty({ description: 'Сумма', example: 1000, minimum: 1 })
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(1, { message: 'Сумма должна быть больше 0' })
    public amount: number;
}

export class AdvanceDto {
    @ApiProperty({
        description: 'Сумма аванса (legacy)',
        example: 1000,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'Сумма аванса должна быть целым числом' })
    @Min(0, { message: 'Сумма аванса не может быть отрицательной' })
    public amount?: number;

    @ApiProperty({
        description: 'ID валюты аванса (legacy)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID валюты аванса должен быть валидным UUID' })
    public currencyId?: string;

    @ApiProperty({
        description: 'Проводки аванса',
        type: () => [AdvanceEntryDto],
        required: false,
    })
    @IsOptional()
    @IsArray({ message: 'Проводки аванса должны быть массивом' })
    @ArrayMinSize(1, { message: 'Добавьте хотя бы одну строку аванса' })
    @ValidateNested({ each: true })
    @Type(() => AdvanceEntryDto)
    public entries?: AdvanceEntryDto[];
}
