import * as fs from 'fs';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class DownloadRegulationUseCase {
    private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'regulations');

    constructor(private readonly prisma: PrismaService) {}

    public async execute(id: string): Promise<{ buffer: Buffer; originalName: string; mimeType: string }> {
        const regulation = await this.prisma.regulation.findFirst({
            where: { id, deleted: false },
        });

        if (!regulation) {
            throw new NotFoundException('Файл не найден');
        }

        const filePath = path.join(DownloadRegulationUseCase.UPLOAD_DIR, regulation.storedName);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('Файл не найден на диске');
        }

        return {
            buffer: fs.readFileSync(filePath),
            originalName: regulation.originalName,
            mimeType: regulation.mimeType,
        };
    }
}
