import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MonthlyJobService {
    private readonly logger = new Logger(MonthlyJobService.name);

    // @Cron('0 0 1 * *', { timeZone: 'UTC' })
    @Cron('* * * * *', { timeZone: 'UTC' })
    public handleMonthlyJob(): void {
        this.logger.log('Monthly job started');

        try {
            // logic

            this.logger.log('Monthly job finished successfully');
        } catch (error) {
            this.logger.error('Monthly job failed', error instanceof Error ? error.stack : undefined);
        }
    }
}
