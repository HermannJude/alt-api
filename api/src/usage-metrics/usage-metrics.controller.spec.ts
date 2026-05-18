import { Test, TestingModule } from '@nestjs/testing';
import { UsageMetricsController } from './usage-metrics.controller';
import { UsageMetricsService } from './usage-metrics.service';

describe('UsageMetricsController', () => {
  let controller: UsageMetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsageMetricsController],
      providers: [UsageMetricsService],
    }).compile();

    controller = module.get<UsageMetricsController>(UsageMetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
