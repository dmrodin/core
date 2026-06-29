import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { BalanceStatus } from '../../../../prisma/generated/prisma';

export class UpdateWalletBalanceStatusDto {
    @ApiProperty({
        description: 'Статус баланса кошелька (цвет)',
        enum: BalanceStatus,
        example: BalanceStatus.positive,
    })
    @IsEnum(BalanceStatus, { message: 'Неверный статус баланса' })
    public balanceStatus: BalanceStatus;
}
