import { ApiProperty } from '@nestjs/swagger';

import { LockedPeriodResponseDto } from './locked-period-response.dto';

export class CreateLockedPeriodResponseDto {
    @ApiProperty({
        description: 'Сообщение о результате',
        example: 'Период блокировки создан',
    })
    public message: string;

    @ApiProperty({
        description: 'Созданный период блокировки',
        type: LockedPeriodResponseDto,
    })
    public lockedPeriod: LockedPeriodResponseDto;
}
