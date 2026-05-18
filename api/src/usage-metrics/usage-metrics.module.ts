import { Module } from '@nestjs/common';
import { UsageMetricsService } from './usage-metrics.service';
import { UsageMetricsController } from './usage-metrics.controller';

@Module({
  controllers: [UsageMetricsController],
  providers: [UsageMetricsService],
})
export class UsageMetricsModule {}
