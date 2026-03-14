import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { GlobalExceptionFilter } from './common';
import { SwaggerTagRegistry } from './common/decorators';
import { MainModule } from './main.module';
import { AdminInitService } from './user/admin-init.service';

async function bootstrap() {
    const logger = new Logger(bootstrap.name);
    const app = await NestFactory.create(MainModule);
    const configService = app.get(ConfigService);

    app.enableShutdownHooks();

    const port: string = configService.getOrThrow('PORT');

    const corsOrigins: string = configService.get('CORS_ORIGINS', '');
    const corsMethods: string = configService.get('CORS_METHODS', 'GET,POST,PUT,PATCH,DELETE');
    const corsHeaders: string = configService.get('CORS_HEADERS', 'Content-Type,Authorization');

    app.enableCors({
        credentials: true,
        origin: corsOrigins ? corsOrigins.split(',').map((origin) => origin.trim()) : true,
        methods: corsMethods.split(',').map((method) => method.trim()),
        allowedHeaders: corsHeaders.split(',').map((header) => header.trim()),
    });

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    let swaggerBuilder = new DocumentBuilder()
        .setTitle('Monte Move Core API')
        .setDescription('API для управления кошельками, операциями и транзакциями')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            'access-token',
        );

    SwaggerTagRegistry.getAll().forEach(({ name, description }) => {
        swaggerBuilder = swaggerBuilder.addTag(name, description);
    });

    const swaggerConfig = swaggerBuilder.build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('/docs', app, swaggerDocument);

    const adminInitService = app.get(AdminInitService);

    await adminInitService.createInitialAdmin();

    await app.listen(port);
    logger.log(`application listening on: http://localhost:${port}`);
    logger.log(`swagger listening on: http://localhost:${port}/docs`);
}

void bootstrap();
