import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '../auth/auth.controller';
import { BcryptHasher } from '../common/services/bcrypt-hasher.service';
import { CookieConfigService } from '../common/services/cookie-config.service';
import { JwtAuthGuard } from './guards/jwt-auth';
import { RolesGuard } from './guards/roles.guard';
import { JwtTokenService } from './jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginUserUseCase, LogoutUserUseCase, RefreshTokensUseCase, RegisterUserUseCase } from './use-cases';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: parseInt(configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        RegisterUserUseCase,
        LoginUserUseCase,
        LogoutUserUseCase,
        RefreshTokensUseCase,
        BcryptHasher,
        JwtTokenService,
        CookieConfigService,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [BcryptHasher, JwtAuthGuard, RolesGuard, JwtTokenService],
})
export class AuthModule {}
