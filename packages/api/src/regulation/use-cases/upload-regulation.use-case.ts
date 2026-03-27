import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class UploadRegulationUseCase {
    private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'regulations');

    constructor(private readonly prisma: PrismaService) {
        if (!fs.existsSync(UploadRegulationUseCase.UPLOAD_DIR)) {
            fs.mkdirSync(UploadRegulationUseCase.UPLOAD_DIR, { recursive: true });
        }
    }

    public async execute(file: Express.Multer.File, userId: string) {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(originalName);
        const storedName = `${crypto.randomUUID()}${ext}`;
        const destPath = path.join(UploadRegulationUseCase.UPLOAD_DIR, storedName);

        fs.writeFileSync(destPath, file.buffer);

        const regulation = await this.prisma.regulation.create({
            data: {
                uploadedById: userId,
                originalName,
                storedName,
                mimeType: file.mimetype,
                size: file.size,
            },
        });

        return {
            message: 'Файл загружен',
            regulation,
        };
    }
}
