import { ApiProperty } from '@nestjs/swagger';

import { OperationDirection } from '../../../../prisma/generated/prisma';

export class OperationEntryResponseDto {
    @ApiProperty({
        description: 'ID записи операции',
        example: '123e4567-e89b-12d3-a456-426614174200',
    })
    public id: string;

    @ApiProperty({
        description: 'ID кошелька',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    public walletId: string;

    @ApiProperty({
        description: 'Информация о кошельке',
        type: () => Object,
    })
    public wallet: {
        id: string;
        name: string;
    };

    @ApiProperty({
        description: 'Направление движения средств',
        enum: OperationDirection,
    })
    public direction: OperationDirection;

    @ApiProperty({ description: 'Сумма движения', example: 1500 })
    public amount: number;

    @ApiProperty({
        description: 'Баланс кошелька до операции',
        example: 5000,
        nullable: true,
    })
    public before: number | null;

    @ApiProperty({
        description: 'Баланс кошелька после операции',
        example: 6500,
        nullable: true,
    })
    public after: number | null;

    @ApiProperty({
        description: 'ID пользователя, создавшего запись',
        example: '123e4567-e89b-12d3-a456-426614174010',
    })
    public userId: string;

    @ApiProperty({
        description: 'ID пользователя, обновившего запись',
        example: '123e4567-e89b-12d3-a456-426614174011',
    })
    public updatedById: string;

    @ApiProperty({
        description: 'Дата создания записи',
        example: '2024-01-01T00:00:00.000Z',
    })
    public createdAt: Date;

    @ApiProperty({
        description: 'Дата последнего обновления записи',
        example: '2024-01-01T00:00:00.000Z',
    })
    public updatedAt: Date;
}

export class OperationTypeSummaryDto {
    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174100',
    })
    public id: string;

    @ApiProperty({
        description: 'Название типа операции',
        example: 'Вывод средств',
    })
    public name: string;
}

export class UserSummaryDto {
    @ApiProperty({
        description: 'ID пользователя',
        example: '123e4567-e89b-12d3-a456-426614174020',
    })
    public id: string;

    @ApiProperty({ description: 'Имя пользователя', example: 'admin' })
    public username: string;
}

export class OperationResponseDto {
    @ApiProperty({
        description: 'ID операции',
        example: '123e4567-e89b-12d3-a456-426614174300',
    })
    public id: string;

    @ApiProperty({
        description: 'ID пользователя, создавшего операцию',
        example: '123e4567-e89b-12d3-a456-426614174020',
    })
    public userId: string;

    @ApiProperty({
        description: 'ID пользователя, обновившего операцию',
        example: '123e4567-e89b-12d3-a456-426614174021',
    })
    public updatedById: string;

    @ApiProperty({
        description: 'ID типа операции',
        example: '123e4567-e89b-12d3-a456-426614174100',
    })
    public typeId: string;

    @ApiProperty({
        description: 'ID заявки',
        example: 1,
        nullable: true,
    })
    public applicationId: number | null;

    @ApiProperty({
        description: 'Описание операции',
        example: 'Перевод средств клиенту',
        nullable: true,
    })
    public description: string | null;

    @ApiProperty({
        description: 'Expense category for operation type "expense"',
        example: 'salary',
        nullable: true,
    })
    public expenseCategory: string | null;

    @ApiProperty({
        description: 'ID группы конверсии',
        example: 5,
        nullable: true,
    })
    public conversionGroupId: number | null;

    @ApiProperty({
        description: 'Дата создания операции',
        example: '2024-01-01T00:00:00.000Z',
    })
    public createdAt: Date;

    @ApiProperty({
        description: 'Дата обновления операции',
        example: '2024-01-01T00:00:00.000Z',
    })
    public updatedAt: Date;

    @ApiProperty({
        description: 'Записи операции',
        type: [OperationEntryResponseDto],
    })
    public entries: OperationEntryResponseDto[];

    @ApiProperty({
        description: 'Информация о типе операции',
        type: OperationTypeSummaryDto,
    })
    public type: OperationTypeSummaryDto;

    @ApiProperty({
        description: 'Информация о создателе операции',
        type: UserSummaryDto,
    })
    public created_by: UserSummaryDto;

    @ApiProperty({
        description: 'Информация об обновившем операцию',
        type: UserSummaryDto,
    })
    public updated_by: UserSummaryDto;
}
