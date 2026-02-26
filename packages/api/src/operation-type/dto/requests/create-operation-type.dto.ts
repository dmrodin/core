import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateOperationTypeDto {
    @ApiProperty({
        description: 'Уникальный код типа операции',
        example: 'withdrawal',
        minLength: 2,
        maxLength: 50,
    })
    @IsNotEmpty({ message: 'Код типа операции обязателен для заполнения' })
    @IsString({ message: 'Код типа операции должен быть строкой' })
    @Length(2, 50, { message: 'Код типа операции должен содержать от 2 до 50 символов' })
    public code: string;

    @ApiProperty({
        description: 'Название типа операции',
        example: 'Вывод средств',
        minLength: 2,
        maxLength: 100,
    })
    @IsNotEmpty({ message: 'Название типа операции обязательно для заполнения' })
    @IsString({ message: 'Название типа операции должно быть строкой' })
    @Length(2, 100, { message: 'Название типа операции должно содержать от 2 до 100 символов' })
    public name: string;

    @ApiProperty({
        description: 'Описание типа операции',
        example: 'Операция по выводу средств на внешний кошелёк',
        maxLength: 500,
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    @MaxLength(500, { message: 'Описание не должно превышать 500 символов' })
    public description?: string;

    @ApiProperty({
        description: 'Отображать как отдельный таб на странице операций',
        example: false,
        default: false,
    })
    @IsBoolean({ message: 'isSeparateTab должно быть булевым значением' })
    public isSeparateTab: boolean;

    @ApiPropertyOptional({
        description: 'Можно ли использовать тип операции как дебетовый',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'isDebit должно быть булевым значением' })
    public isDebit?: boolean;

    @ApiPropertyOptional({
        description: 'Можно ли использовать тип операции как кредитовый',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'isCredit должно быть булевым значением' })
    public isCredit?: boolean;

    @ApiPropertyOptional({
        description: 'Активность типа операции',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'Активность должна быть булевым значением' })
    public active?: boolean;
}
