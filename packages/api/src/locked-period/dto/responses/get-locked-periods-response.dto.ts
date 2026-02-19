import { ApiProperty } from '@nestjs/swagger';

import { LockedPeriodResponseDto } from './locked-period-response.dto';

export class GetLockedPeriodsResponseDto {
    @ApiProperty({
        description: 'Список периодов блокировки',
        type: [LockedPeriodResponseDto],
    })
    public lockedPeriods: LockedPeriodResponseDto[];
}
