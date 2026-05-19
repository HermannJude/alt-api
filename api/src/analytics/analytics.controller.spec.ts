import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockDepartmentCostSummary = {
    data: [
      {
        department: 'Engineering',
        total_monthly_cost: 281,
        tools_count: 32,
        total_users: 44,
        average_cost_per_tool: 8.78,
        cost_percentage: 80.1,
      },
      {
        department: 'Finance',
        total_monthly_cost: 70,
        tools_count: 1,
        total_users: 3,
        average_cost_per_tool: 70,
        cost_percentage: 19.9,
      },
    ],
    total_cost: 351,
    most_expensive_department: 'Engineering',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getDepartmentCosts: jest.fn(),
            getExpensiveTools: jest.fn(),
            getToolsByCategory: jest.fn(),
            getLowUsageTools: jest.fn(),
            getVendorSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDepartmentCosts', () => {
    it('should be defined', () => {
      expect(controller.getDepartmentCosts).toBeDefined();
    });

    it('getDepartmentCosts should return data from service', async () => {
      const expectedResponse = mockDepartmentCostSummary;

      jest
        .spyOn(service, 'getDepartmentCosts')
        .mockResolvedValue(expectedResponse);
      await expect(controller.getDepartmentCosts()).resolves.toEqual(
        expectedResponse,
      );
      expect(service.getDepartmentCosts).toHaveBeenCalledWith(
        'department',
        'asc',
      );
    });

    it('getDepartmentCosts should delegate to service with default params', async () => {
      const expectedResponse = {
        data: [],
        total_cost: 0,
        most_expensive_department: null,
      };

      jest
        .spyOn(service, 'getDepartmentCosts')
        .mockResolvedValue(expectedResponse);

      await expect(controller.getDepartmentCosts()).resolves.toEqual(
        expectedResponse,
      );
      expect(service.getDepartmentCosts).toHaveBeenCalledWith(
        'department',
        'asc',
      );
    });

    it('getDepartmentCosts should delegate to service with provided params', async () => {
      const expectedResponse = {
        data: [],
        total_cost: 0,
        most_expensive_department: null,
      };

      jest
        .spyOn(service, 'getDepartmentCosts')
        .mockResolvedValue(expectedResponse);

      await expect(
        controller.getDepartmentCosts('total_cost', 'desc'),
      ).resolves.toEqual(expectedResponse);
      expect(service.getDepartmentCosts).toHaveBeenCalledWith(
        'total_cost',
        'desc',
      );
    });
  });

  it('getExpensiveTools should delegate to service with default params', async () => {
    const expectedResponse = {
      data: [],
      total_tools_analyzed: 0,
      potential_savings_identified: 0,
    };

    jest
      .spyOn(service, 'getExpensiveTools')
      .mockResolvedValue(expectedResponse);

    await expect(controller.getExpensiveTools()).resolves.toEqual(
      expectedResponse,
    );
    expect(service.getExpensiveTools).toHaveBeenCalledWith(10);
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

const notImplementedError = new NotImplementedException(
  'This endpoint is not implemented yet',
);
