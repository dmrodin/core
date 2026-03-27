import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { RoleCode } from '../../prisma/generated/prisma';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiIdParam, ApiReadResponses, ApiTag } from '../common';
import {
    DeleteRegulationResponseDto,
    GetRegulationsResponseDto,
    UploadRegulationResponseDto,
} from './dto';
import {
    DeleteRegulationUseCase,
    DownloadRegulationUseCase,
    GetRegulationsUseCase,
    UploadRegulationUseCase,
} from './use-cases';

@ApiTag('Regulations', 'Регламенты')
@ApiBearerAuth('access-token')
@Controller('regulations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegulationController {
    constructor(
        private readonly uploadRegulationUseCase: UploadRegulationUseCase,
        private readonly getRegulationsUseCase: GetRegulationsUseCase,
        private readonly downloadRegulationUseCase: DownloadRegulationUseCase,
        private readonly deleteRegulationUseCase: DeleteRegulationUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(RoleCode.admin)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
    @ApiOperation({ summary: 'Загрузить регламент (PDF или Excel)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 201, type: UploadRegulationResponseDto })
    public async upload(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUserId() userId: string,
    ): Promise<UploadRegulationResponseDto> {
        const result = await this.uploadRegulationUseCase.execute(file, userId);

        return {
            message: result.message,
            regulation: {
                id: result.regulation.id,
                originalName: result.regulation.originalName,
                mimeType: result.regulation.mimeType,
                size: result.regulation.size,
                createdAt: result.regulation.createdAt,
            },
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({ summary: 'Получить список регламентов' })
    @ApiResponse({ status: 200, type: GetRegulationsResponseDto })
    @ApiReadResponses()
    public async getAll(): Promise<GetRegulationsResponseDto> {
        const result = await this.getRegulationsUseCase.execute();

        return { regulations: result.regulations };
    }

    @Get(':id/download')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin, RoleCode.moderator, RoleCode.user)
    @ApiOperation({ summary: 'Скачать файл регламента' })
    @ApiIdParam('Уникальный идентификатор регламента')
    @ApiResponse({ status: 200, description: 'Файл регламента' })
    @ApiReadResponses()
    public async download(@Param('id') id: string): Promise<StreamableFile> {
        const result = await this.downloadRegulationUseCase.execute(id);

        const encodedFilename = encodeURIComponent(result.originalName);
        const disposition = `inline; filename*=UTF-8''${encodedFilename}`;

        return new StreamableFile(result.buffer, {
            type: result.mimeType,
            disposition,
        });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(RoleCode.admin)
    @ApiOperation({ summary: 'Удалить регламент' })
    @ApiIdParam('Уникальный идентификатор регламента')
    @ApiResponse({ status: 200, type: DeleteRegulationResponseDto })
    @ApiReadResponses()
    public async delete(@Param('id') id: string): Promise<DeleteRegulationResponseDto> {
        return await this.deleteRegulationUseCase.execute(id);
    }
}
