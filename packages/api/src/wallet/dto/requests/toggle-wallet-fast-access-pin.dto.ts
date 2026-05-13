import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleWalletFastAccessPinDto {
    @ApiProperty({
        description: 'Добавить кошелек в личный быстрый доступ текущего пользователя',
        example: true,
    })
    @IsNotEmpty({ message: 'Значение pinned обязательно' })
    @IsBoolean({ message: 'pinned должен быть boolean' })
    public pinned: boolean;
}
