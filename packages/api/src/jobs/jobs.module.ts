import { Module } from '@nestjs/common';

import { FeedbackModule } from '../feedback/feedback.module';
import { MonthlyJobService } from './monthly.job';
import { SberRateJobService } from './sber-rate.job';

@Module({
    imports: [FeedbackModule],
    providers: [MonthlyJobService, SberRateJobService],
})
export class JobsModule {}
