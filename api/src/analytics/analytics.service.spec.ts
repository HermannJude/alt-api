import { Test, TestingModule } from '@nestjs/testing';
import { Department, ToolStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService - getDepartmentCosts', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockTools = [
    {
      id: 1,
      name: 'Slack',
      description: null,
      vendor: 'Slack Inc',
      websiteUrl: 'https://slack.com',
      categoryId: 1,
      monthlyCost: 100,
      ownerDepartment: Department.Engineering,
      status: ToolStatus.active,
      activeUsersCount: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      id: 2,
      name: 'GitHub',
      description: null,
      vendor: 'GitHub',
      websiteUrl: 'https://github.com',
      categoryId: 2,
      monthlyCost: 200,
      ownerDepartment: Department.Engineering,
      status: ToolStatus.active,
      activeUsersCount: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      id: 3,
      name: 'Salesforce',
      description: null,
      vendor: 'Salesforce',
      websiteUrl: 'https://salesforce.com',
      categoryId: 3,
      monthlyCost: 150,
      ownerDepartment: Department.Sales,
      status: ToolStatus.active,
      activeUsersCount: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            tool: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty data when no tools', async () => {
    jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);

    const result = await service.getDepartmentCosts();

    expect(result).toEqual({
      data: [],
      total_cost: 0,
      most_expensive_department: null,
    });
  });

  it('single department should have 100% cost percentage', async () => {
    const engineeringTools = mockTools.filter(
      (tool) => tool.ownerDepartment === Department.Engineering,
    );
    jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(engineeringTools);

    const result = await service.getDepartmentCosts();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].department).toBe(Department.Engineering);
    expect(result.data[0].cost_percentage).toBe(100);
  });

  it('should aggregate single department correctly', async () => {
    const engineeringTools = mockTools.filter(
      (tool) => tool.ownerDepartment === Department.Engineering,
    );
    jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(engineeringTools);

    const result = await service.getDepartmentCosts();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].department).toBe(Department.Engineering);
    expect(result.data[0].total_monthly_cost).toBe(300);
    expect(result.data[0].tools_count).toBe(2);
    expect(result.data[0].total_users).toBe(45);
    expect(result.data[0].cost_percentage).toBe(100);
    expect(result.total_cost).toBe(300);
    expect(result.most_expensive_department).toBe(Department.Engineering);
  });

  it('should aggregate multiple departments with correct percentages', async () => {
    jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(mockTools);

    const result = await service.getDepartmentCosts();

    expect(result.data).toHaveLength(2);

    const engineering = result.data.find(
      (department) => department.department === Department.Engineering,
    );
    const sales = result.data.find(
      (department) => department.department === Department.Sales,
    );

    expect(engineering).toBeDefined();
    expect(sales).toBeDefined();

    if (engineering) {
      expect(engineering.total_monthly_cost).toBe(300);
      expect(engineering.cost_percentage).toBeCloseTo(66.7, 1);
    }

    if (sales) {
      expect(sales.total_monthly_cost).toBe(150);
      expect(sales.cost_percentage).toBeCloseTo(33.3, 1);
    }

    expect(result.total_cost).toBe(450);
    expect(result.most_expensive_department).toBe(Department.Engineering);
  });

  it('should handle division correctly with 2 decimals on money and 1 on percentage', async () => {
    jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(mockTools);

    const result = await service.getDepartmentCosts();

    result.data.forEach((department) => {
      expect(countDecimals(department.total_monthly_cost)).toBeLessThanOrEqual(
        2,
      );
      expect(countDecimals(department.cost_percentage)).toBeLessThanOrEqual(1);
    });
  });

  describe('sorting', () => {
    it('should sort by total_cost descending', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(mockTools);

      const result = await service.getDepartmentCosts('total_cost', 'desc');

      const costs = result.data.map(
        (department) => department.total_monthly_cost,
      );
      expect(costs[0]).toBeGreaterThanOrEqual(costs[1]);
    });

    it('should sort by department name ascending by default', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(mockTools);

      const result = await service.getDepartmentCosts('department', 'asc');

      const departments = result.data.map(
        (department) => department.department,
      );
      expect(departments).toEqual([...departments].sort());
    });
  });

  describe('calculation', () => {
    it('should calculate average_cost_per_tool correctly', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(mockTools);

      const result = await service.getDepartmentCosts();

      const engineering = result.data.find(
        (department) => department.department === Department.Engineering,
      );
      expect(engineering).toBeDefined();
      if (engineering) {
        expect(engineering.average_cost_per_tool).toBe(150);
      }
    });
  });
});

const countDecimals = (value: number) => {
  const [, decimals = ''] = value.toString().split('.'); // Handle cases like 100 -> no decimals, 100.0 -> 1 decimal, 100.00 -> 2 decimals
  return decimals.length;
};
