import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class GetConversionWalletsReportDto {
    @ApiPropertyOptional({
        description: 'Начальная дата выборки (включительно)',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    public dateStart?: Date;

    @ApiPropertyOptional({
        description: 'Конечная дата выборки (включительно)',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    public dateEnd?: Date;

    @ApiPropertyOptional({
        description:
            'Разделы кошельков: all, hidden или коды типов кошельков. Можно передавать через запятую, например "hidden,inskech".',
        type: String,
        example: 'all',
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
