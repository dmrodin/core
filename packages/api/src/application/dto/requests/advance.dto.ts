import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AdvanceDto {
    @ApiProperty({ description: 'Сумма аванса', example: 1000, minimum: 0 })
    @IsInt({ message: 'Сумма аванса должна быть целым числом' })
    @Min(0, { message: 'Сумма аванса не может быть отрицательной' })
    public amount: number;

    @ApiProperty({
        description: 'ID валюты аванса',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4', { message: 'ID валюты аванса должен быть валидным UUID' })
    public currencyId: string;
}
