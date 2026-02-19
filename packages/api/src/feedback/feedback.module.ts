import { Module } from '@nestjs/common';

import { FeedbackController } from './feedback.controller';
import { TelegramService } from './telegram.service';
import { SendFeedbackUseCase } from './use-cases/send-feedback.use-case';

@Module({
    controllers: [FeedbackController],
    providers: [TelegramService, SendFeedbackUseCase],
    exports: [TelegramService],
})
export class FeedbackModule {}
