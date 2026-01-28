import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { ApplicationStatus } from '../../../../prisma/generated/prisma';
import { AdvanceDto } from './advance.dto';

export class UpdateApplicationDto {
    @ApiProperty({
        description: 'Описание заявки',
        example: 'Обмен долларов на рубли по выгодному курсу',
        maxLength: 2000,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Описание должно быть строкой' })
    @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
    public description?: string;

    @ApiProperty({
        description: 'Статус заявки',
        enum: ApplicationStatus,
        example: ApplicationStatus.open,
        required: false,
    })
    @IsOptional()
    @IsEnum(ApplicationStatus, { message: 'Неверный статус заявки' })
    public status?: ApplicationStatus;

    @ApiProperty({
        description: 'Сумма заявки',
        example: 5000,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(0, { message: 'Сумма не может быть отрицательной' })
    public amount?: number;

    @ApiProperty({
        description: 'ID валюты',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID валюты должен быть валидным UUID' })
    public currencyId?: string;

    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID типа операции должен быть валидным UUID' })
    public operationTypeId?: string;

    @ApiProperty({
        description: 'ID исполнителя',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID исполнителя должен быть валидным UUID' })
    public assigneeUserId?: string;

    @ApiProperty({
        description: 'ID операции',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'ID операции должен быть валидным UUID' })
    public operationId?: string;

    @ApiProperty({
        description: 'Telegram username',
        example: 'username',
        maxLength: 100,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Telegram username должен быть строкой' })
    @MaxLength(100, {
        message: 'Telegram username не должен превышать 100 символов',
    })
    public telegramUsername?: string;

    @ApiProperty({
        description: 'Номер телефона',
        example: '+7 (999) 123-45-67',
        maxLength: 20,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Телефон должен быть строкой' })
    @MaxLength(20, { message: 'Телефон не должен превышать 20 символов' })
    public phone?: string;

    @ApiProperty({
        description: 'Дата встречи',
        example: '2024-12-25T15:30:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString({}, { message: 'Дата встречи должна быть валидной датой' })
    public meetingDate?: string;

    @ApiProperty({
        description: 'Аванс (опционально)',
        required: false,
        type: () => AdvanceDto,
    })
    @IsOptional()
    public advance?: AdvanceDto;
}
