import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class GetBalancesReportDto {
    @ApiProperty({
        description: 'Дата и время снимка балансов (ISO-8601)',
        type: String,
        format: 'date-time',
        example: '2026-02-01T00:00:00.000Z',
    })
    @Type(() => Date)
    @IsDate()
    public snapshotAt!: Date;

    @ApiProperty({
        description:
            'Разделы кошельков: all, hidden или коды типов кошельков. Можно передавать через запятую, например "hidden,inskech".',
        type: String,
        example: 'all',
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return ['all'];
        }

        const values = Array.isArray(value) ? value : [value];

        const normalized = values
            .flatMap((item) => String(item).split(','))
            .map((item) => item.trim())
            .filter(Boolean);

        return normalized.length > 0 ? normalized : ['all'];
    })
    @IsArray()
    @IsString({ each: true })
    public sections?: string[];
}
