import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateOperationTypeDto {
    @ApiProperty({
        description: 'Новый код типа операции',
        example: 'deposit',
        minLength: 2,
        maxLength: 50,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Код типа операции должен быть строкой' })
    @Length(2, 50, { message: 'Код типа операции должен содержать от 2 до 50 символов' })
    public code?: string;

    @ApiProperty({
        description: 'Новое название типа операции',
        example: 'Пополнение',
        minLength: 2,
        maxLength: 100,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Название типа операции должно быть строкой' })
    @Length(2, 100, { message: 'Название типа операции должно содержать от 2 до 100 символов' })
    public name?: string;

    @ApiProperty({
        description: 'Новое описание типа операции',
        example: 'Пополнение средств на счёт клиента',
        maxLength: 500,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    @MaxLength(500, { message: 'Описание не должно превышать 500 символов' })
    public description?: string;

    @ApiProperty({
        description: 'Отображать как отдельный таб на странице операций',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'isSeparateTab должно быть булевым значением' })
    public isSeparateTab?: boolean;

    @ApiPropertyOptional({
        description: 'Можно ли использовать тип операции как дебетовый',
        example: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'isDebit должно быть булевым значением' })
    public isDebit?: boolean;

    @ApiPropertyOptional({
        description: 'Можно ли использовать тип операции как кредитовый',
        example: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'isCredit должно быть булевым значением' })
    public isCredit?: boolean;

    @ApiPropertyOptional({
        description: 'Активность типа операции',
        example: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'Активность должна быть булевым значением' })
    public active?: boolean;
}
