import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class DeleteRegulationUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(id: string) {
        const regulation = await this.prisma.regulation.findFirst({
            where: { id, deleted: false },
        });

        if (!regulation) {
            throw new NotFoundException('Регламент не найден');
        }

        await this.prisma.regulation.update({
            where: { id },
            data: { deleted: true },
        });

        return { message: 'Регламент удалён' };
    }
}
