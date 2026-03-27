import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';
import { SessionActivityMiddleware } from './auth/middleware/session-activity.middleware';
import { BankModule } from './bank/bank.module';
import { BcryptHasher } from './common/services/bcrypt-hasher.service';
import { PrismaModule } from './common/services/prisma.module';
import { CurrencyModule } from './currency/currency.module';
import { FeedbackModule } from './feedback/feedback.module';
import { GuideModule } from './guide/guide.module';
import { JobsModule } from './jobs/jobs.module';
import { LockedPeriodModule } from './locked-period/locked-period.module';
import { NetworkModule } from './network/network.module';
import { NetworkTypeModule } from './network-type/network-type.module';
import { OperationModule } from './operation/operation.module';
import { OperationTypeModule } from './operation-type/operation-type.module';
import { ParserModule } from './parser/parser.module';
import { PlatformModule } from './platform/platform.module';
import { RegulationModule } from './regulation/regulation.module';
import { SessionModule } from './session/session.module';
import { AdminInitService } from './user/admin-init.service';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { WalletTypeModule } from './wallet-type/wallet-type.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [
                {
                    ttl: configService.getOrThrow('THROTTLER_TTL_MS'),
                    limit: configService.getOrThrow('THROTTLER_LIMIT'),
                },
            ],
        }),
        AuthModule,
        GuideModule,
        CurrencyModule,
        FeedbackModule,
        ApplicationModule,
        UserModule,
        OperationModule,
        OperationTypeModule,
        SessionModule,
        WalletModule,
        WalletTypeModule,
        NetworkModule,
        NetworkTypeModule,
        ParserModule,
        PlatformModule,
        BankModule,
        RegulationModule,
        LockedPeriodModule,
        ScheduleModule.forRoot(),
        JobsModule,
    ],
    providers: [BcryptHasher, AdminInitService],
})
export class MainModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SessionActivityMiddleware).forRoutes('*');
    }
}
