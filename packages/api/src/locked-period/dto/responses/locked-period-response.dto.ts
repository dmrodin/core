import { ApiProperty } from '@nestjs/swagger';

export class LockedPeriodResponseDto {
    @ApiProperty({
        description: 'ID периода блокировки',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public id: string;

    @ApiProperty({
        description: 'Дата начала периода',
        example: '2026-01-01T00:00:00.000Z',
    })
    public dateFrom: Date;

    @ApiProperty({
        description: 'Дата окончания периода',
        example: '2026-01-31T00:00:00.000Z',
    })
    public dateTo: Date;

    @ApiProperty({
        description: 'Дата установки блокировки',
        example: '2026-02-10T09:12:00.000Z',
    })
    public lockedAt: Date;

    @ApiProperty({
        description: 'Активность блокировки',
        example: true,
    })
    public isActive: boolean;
}
