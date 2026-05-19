import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const notImplementedError = new NotImplementedException(
    'This endpoint is not implemented yet',
  );

  it('getDepartmentCosts should throw not implemented', () => {
    expect(() => controller.getDepartmentCosts()).toThrow(notImplementedError);
  });

  it('getExpensiveTools should throw not implemented', () => {
    expect(() => controller.getExpensiveTools()).toThrow(notImplementedError);
  });

  it('getToolsByCategory should throw not implemented', () => {
    expect(() => controller.getToolsByCategory()).toThrow(notImplementedError);
  });

  it('getLowUsageTools should throw not implemented', () => {
    expect(() => controller.getLowUsageTools()).toThrow(notImplementedError);
  });

  it('getVendorSummary should throw not implemented', () => {
    expect(() => controller.getVendorSummary()).toThrow(notImplementedError);
  });
});
