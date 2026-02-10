import { ApiProperty } from '@nestjs/swagger';

import { LockedPeriodResponseDto } from './locked-period-response.dto';

export class OpenLockedPeriodResponseDto {
    @ApiProperty({
        description: 'Сообщение о результате',
        example: 'Период успешно открыт',
    })
    public message: string;

    @ApiProperty({
        description: 'Обновленный период блокировки',
        type: LockedPeriodResponseDto,
    })
    public lockedPeriod: LockedPeriodResponseDto;
}
