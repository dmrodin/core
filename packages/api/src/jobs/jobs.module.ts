import { Module } from '@nestjs/common';

import { MonthlyJobService } from './monthly.job';
import { SberRateJobService } from './sber-rate.job';

@Module({
    providers: [MonthlyJobService, SberRateJobService],
})
export class JobsModule {}
