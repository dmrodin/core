import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class GetRegulationsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute() {
        const regulations = await this.prisma.regulation.findMany({
            where: { deleted: false },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                originalName: true,
                mimeType: true,
                size: true,
                createdAt: true,
            },
        });

        return { regulations };
    }
}
