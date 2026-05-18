import { Test, TestingModule } from '@nestjs/testing';
import { UsageMetricsService } from './usage-metrics.service';

describe('UsageMetricsService', () => {
  let service: UsageMetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsageMetricsService],
    }).compile();

    service = module.get<UsageMetricsService>(UsageMetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
