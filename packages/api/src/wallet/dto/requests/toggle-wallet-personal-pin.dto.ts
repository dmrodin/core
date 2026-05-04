import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleWalletPersonalPinDto {
    @ApiProperty({
        description: 'Закрепить/открепить кошелек на главной для текущего пользователя',
        example: true,
    })
    @IsNotEmpty({ message: 'Значение pinned обязательно' })
    @IsBoolean({ message: 'pinned должен быть boolean' })
    public pinned: boolean;
}
