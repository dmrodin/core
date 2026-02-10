import { Module } from '@nestjs/common';

import { MonthlyJobService } from './monthly.job';

@Module({
    providers: [MonthlyJobService],
})
export class JobsModule {}
