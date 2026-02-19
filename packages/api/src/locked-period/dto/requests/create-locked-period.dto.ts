import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateLockedPeriodDto {
    @ApiProperty({
        description: 'Дата начала периода',
        example: '2026-01-01',
    })
    @IsDateString({}, { message: 'Дата начала должна быть валидной датой' })
    public dateFrom: string;

    @ApiProperty({
        description: 'Дата окончания периода',
        example: '2026-01-31',
    })
    @IsDateString({}, { message: 'Дата окончания должна быть валидной датой' })
    public dateTo: string;
}
