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

  describe('getExpensiveTools', () => {
    const expensiveToolMocks = [
      {
        id: 10,
        name: 'Enterprise CRM',
        description: null,
        vendor: 'BigCorp',
        websiteUrl: 'https://bigcorp.example',
        categoryId: 1,
        monthlyCost: 200,
        ownerDepartment: Department.Sales,
        status: ToolStatus.active,
        activeUsersCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 11,
        name: 'Design Suite',
        description: null,
        vendor: 'DesignCo',
        websiteUrl: 'https://designco.example',
        categoryId: 2,
        monthlyCost: 150,
        ownerDepartment: Department.Marketing,
        status: ToolStatus.active,
        activeUsersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 12,
        name: 'DevOps Platform',
        description: null,
        vendor: 'Opsify',
        websiteUrl: 'https://opsify.example',
        categoryId: 3,
        monthlyCost: 90,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ];

    it('should return empty analysis for empty database', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);

      const result = await service.getExpensiveTools();

      expect(result).toEqual({
        data: [],
        total_tools_analyzed: 0,
        potential_savings_identified: 0,
      });
    });

    it('should respect limit and sort by monthly cost descending', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(expensiveToolMocks);

      const result = await service.getExpensiveTools(2);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].monthly_cost).toBe(200);
      expect(result.data[1].monthly_cost).toBe(150);
    });

    it('should filter by minimum cost', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(expensiveToolMocks);

      const result = await service.getExpensiveTools(10, 160);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].monthly_cost).toBe(200);
    });

    it('should calculate cost per user and handle zero users gracefully', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(expensiveToolMocks);

      const result = await service.getExpensiveTools(10);

      const zeroUserTool = result.data.find(
        (tool) => tool.name === 'Design Suite',
      );

      expect(zeroUserTool).toBeDefined();
      expect(zeroUserTool?.cost_per_user).toBe(Infinity);
      expect(zeroUserTool?.efficiency_rating).toBe('low');
    });

    it('should calculate efficiency ratings based on company average', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(expensiveToolMocks);

      const result = await service.getExpensiveTools(10);

      const enterpriseCrm = result.data.find(
        (tool) => tool.name === 'Enterprise CRM',
      );
      const devOps = result.data.find(
        (tool) => tool.name === 'DevOps Platform',
      );

      expect(enterpriseCrm?.efficiency_rating).toBe('low');
      expect(devOps?.efficiency_rating).toBe('excellent');
    });

    it('should compute potential savings from low efficiency tools', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(expensiveToolMocks);

      const result = await service.getExpensiveTools(10);

      expect(result.potential_savings_identified).toBe(350);
      expect(result.total_tools_analyzed).toBe(3);
    });

    it('should reject invalid limits', async () => {
      await expect(service.getExpensiveTools(0)).rejects.toThrow(
        'limit must be a positive integer between 1 and 100',
      );
      await expect(service.getExpensiveTools(101)).rejects.toThrow(
        'limit must be a positive integer between 1 and 100',
      );
    });
  });

  describe('getToolsByCategory', () => {
    const categoryMocks = [
      {
        id: 1,
        name: 'Design',
        description: null,
        colorHex: '#6366f1',
        slug: 'design',
        createdAt: new Date(),
      },
      {
        id: 2,
        name: 'Productivity',
        description: null,
        colorHex: '#6366f1',
        slug: 'productivity',
        createdAt: new Date(),
      },
      {
        id: 3,
        name: 'Communication',
        description: null,
        colorHex: '#6366f1',
        slug: 'communication',
        createdAt: new Date(),
      },
    ];

    const toolsByCategory = [
      {
        id: 1,
        name: 'Figma',
        description: null,
        vendor: 'Figma',
        websiteUrl: 'https://figma.com',
        categoryId: 1,
        monthlyCost: 600,
        ownerDepartment: Department.Marketing,
        status: ToolStatus.active,
        activeUsersCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: categoryMocks[0],
      } as any,
      {
        id: 2,
        name: 'Sketch',
        description: null,
        vendor: 'Sketch',
        websiteUrl: 'https://sketch.com',
        categoryId: 1,
        monthlyCost: 400,
        ownerDepartment: Department.Marketing,
        status: ToolStatus.active,
        activeUsersCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: categoryMocks[0],
      } as any,
      {
        id: 3,
        name: 'Notion',
        description: null,
        vendor: 'Notion',
        websiteUrl: 'https://notion.so',
        categoryId: 2,
        monthlyCost: 300,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: categoryMocks[1],
      } as any,
      {
        id: 4,
        name: 'Slack',
        description: null,
        vendor: 'Slack',
        websiteUrl: 'https://slack.com',
        categoryId: 3,
        monthlyCost: 200,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: categoryMocks[2],
      } as any,
    ];

    it('should return empty data when no tools', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);

      const result = await service.getToolsByCategory();

      expect(result).toEqual({
        data: [],
        most_expensive_category: null,
        most_efficient_category: null,
      });
    });

    it('should aggregate tools correctly by category', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      expect(result.data).toHaveLength(3);

      const designCat = result.data.find(
        (cat) => cat.category_name === 'Design',
      );
      expect(designCat).toBeDefined();
      if (designCat) {
        expect(designCat.total_cost).toBe(1000);
        expect(designCat.tools_count).toBe(2);
        expect(designCat.total_users).toBe(15);
      }
    });

    it('should calculate percentage_of_budget correctly', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      // Total budget: 1000 + 300 + 200 = 1500
      // Design: 1000/1500 * 100 = 66.7%
      // Productivity: 300/1500 * 100 = 20%
      // Communication: 200/1500 * 100 = 13.3%
      const design = result.data.find((cat) => cat.category_name === 'Design');
      const productivity = result.data.find(
        (cat) => cat.category_name === 'Productivity',
      );
      const communication = result.data.find(
        (cat) => cat.category_name === 'Communication',
      );

      expect(design?.percentage_of_budget).toBeCloseTo(66.7, 1);
      expect(productivity?.percentage_of_budget).toBeCloseTo(20, 1);
      expect(communication?.percentage_of_budget).toBeCloseTo(13.3, 1);
    });

    it('should sum percentages to 100 within tolerance', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      const totalPercentage = result.data.reduce(
        (sum, cat) => sum + cat.percentage_of_budget,
        0,
      );
      expect(totalPercentage).toBeCloseTo(100, 0);
    });

    it('should calculate average_cost_per_user correctly', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      const design = result.data.find((cat) => cat.category_name === 'Design');
      // Design: 1000 / 15 = 66.67
      expect(design?.average_cost_per_user).toBeCloseTo(66.67, 2);
    });

    it('should identify most expensive category', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      expect(result.most_expensive_category).toBe('Design');
    });

    it('should identify most efficient category (lowest cost_per_user)', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      // Design: 66.67 cost/user
      // Productivity: 10 cost/user (most efficient)
      // Communication: 4 cost/user (most efficient!)
      expect(result.most_efficient_category).toBe('Communication');
    });

    it('should exclude categories with zero users from efficiency calculation', async () => {
      const toolsWithZeroUsers = [
        ...toolsByCategory,
        {
          id: 5,
          name: 'Unused Tool',
          description: null,
          vendor: 'Unused',
          websiteUrl: 'https://unused.com',
          categoryId: 4,
          monthlyCost: 500,
          ownerDepartment: Department.Sales,
          status: ToolStatus.active,
          activeUsersCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: 4,
            name: 'Unused Category',
            description: null,
            colorHex: '#6366f1',
            slug: 'unused',
            createdAt: new Date(),
          },
        } as any,
      ];

      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsWithZeroUsers);

      const result = await service.getToolsByCategory();

      const unusedCat = result.data.find(
        (cat) => cat.category_name === 'Unused Category',
      );
      expect(unusedCat?.average_cost_per_user).toBeNull();
      // most_efficient_category should still be Communication (skipping Unused)
      expect(result.most_efficient_category).toBe('Communication');
    });

    it('should sort categories by id', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      expect(result.data[0].category_id).toBe(1);
      expect(result.data[1].category_id).toBe(2);
      expect(result.data[2].category_id).toBe(3);
    });

    it('should handle decimals correctly (1 decimal for percentage, 2 for cost_per_user)', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(toolsByCategory);

      const result = await service.getToolsByCategory();

      result.data.forEach((cat) => {
        expect(countDecimals(cat.percentage_of_budget)).toBeLessThanOrEqual(1);
        if (
          cat.average_cost_per_user !== null &&
          cat.average_cost_per_user !== undefined
        ) {
          expect(countDecimals(cat.average_cost_per_user)).toBeLessThanOrEqual(
            2,
          );
        }
      });
    });
  });

  describe('getLowUsageTools', () => {
    const lowUsageMocks = [
      {
        id: 20,
        name: 'Dormant Platform',
        description: null,
        vendor: 'DormantCo',
        websiteUrl: 'https://dormant.example',
        categoryId: 1,
        monthlyCost: 500,
        ownerDepartment: Department.Sales,
        status: ToolStatus.active,
        activeUsersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 21,
        name: 'Review App',
        description: null,
        vendor: 'ReviewCo',
        websiteUrl: 'https://review.example',
        categoryId: 2,
        monthlyCost: 250,
        ownerDepartment: Department.Marketing,
        status: ToolStatus.active,
        activeUsersCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 22,
        name: 'Monitor App',
        description: null,
        vendor: 'MonitorCo',
        websiteUrl: 'https://monitor.example',
        categoryId: 3,
        monthlyCost: 100,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 23,
        name: 'Filtered Out',
        description: null,
        vendor: 'FilterCo',
        websiteUrl: 'https://filter.example',
        categoryId: 4,
        monthlyCost: 75,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ];

    it('should return empty savings analysis for empty database', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);

      const result = await service.getLowUsageTools();

      expect(result).toEqual({
        data: [],
        monthly_savings: 0,
        annual_savings: 0,
      });
    });

    it('should filter tools by maxUsers and compute savings', async () => {
      jest
        .spyOn(prisma.tool, 'findMany')
        .mockResolvedValue(
          lowUsageMocks.filter((tool) => tool.activeUsersCount <= 5) as any,
        );

      const result = await service.getLowUsageTools(5);

      expect(result.data).toHaveLength(3);
      expect(result.data.some((tool) => tool.name === 'Filtered Out')).toBe(
        false,
      );
      expect(prisma.tool.findMany).toHaveBeenCalledWith({
        where: {
          status: ToolStatus.active,
          activeUsersCount: {
            lte: 5,
          },
        },
      });
      expect(result.monthly_savings).toBe(850);
      expect(result.annual_savings).toBe(10200);
    });

    it('should assign high warning to tools with zero users', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(lowUsageMocks);

      const result = await service.getLowUsageTools();

      const dormant = result.data.find(
        (tool) => tool.name === 'Dormant Platform',
      );

      expect(dormant?.warning_level).toBe('high');
      expect(dormant?.potential_action).toBe(
        'Consider canceling or downgrading',
      );
    });

    it('should apply warning thresholds correctly', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(lowUsageMocks);

      const result = await service.getLowUsageTools();

      expect(
        result.data.find((tool) => tool.name === 'Review App')?.warning_level,
      ).toBe('medium');
      expect(
        result.data.find((tool) => tool.name === 'Monitor App')?.warning_level,
      ).toBe('medium');
    });

    it('should reject invalid max_users values', async () => {
      await expect(service.getLowUsageTools(0)).rejects.toThrow(
        'max_users must be a positive integer',
      );
    });
  });

  describe('getVendorSummary', () => {
    const vendorMocks = [
      {
        id: 30,
        name: 'Design Pro',
        description: null,
        vendor: 'Acme Corp',
        websiteUrl: 'https://acme.example',
        categoryId: 1,
        monthlyCost: 200,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 31,
        name: 'Design Lite',
        description: null,
        vendor: 'Acme Corp',
        websiteUrl: 'https://acme.example/lite',
        categoryId: 2,
        monthlyCost: 100,
        ownerDepartment: Department.Sales,
        status: ToolStatus.active,
        activeUsersCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 32,
        name: 'Niche Tool',
        description: null,
        vendor: 'SoloVendor',
        websiteUrl: 'https://solo.example',
        categoryId: 3,
        monthlyCost: 40,
        ownerDepartment: Department.Marketing,
        status: ToolStatus.active,
        activeUsersCount: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        id: 33,
        name: 'Premium Tool',
        description: null,
        vendor: 'PremiumCo',
        websiteUrl: 'https://premium.example',
        categoryId: 4,
        monthlyCost: 500,
        ownerDepartment: Department.Engineering,
        status: ToolStatus.active,
        activeUsersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ];

    it('should return empty summary for empty database', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);

      const result = await service.getVendorSummary();

      expect(result).toEqual({
        data: [],
        most_expensive_vendor: null,
        most_efficient_vendor: null,
        single_tool_vendors_count: 0,
      });
    });

    it('should group tools by vendor and concatenate unique sorted departments', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(vendorMocks);

      const result = await service.getVendorSummary();

      const acme = result.data.find((vendor) => vendor.vendor === 'Acme Corp');
      expect(acme).toBeDefined();
      expect(acme?.tools_count).toBe(2);
      expect(acme?.departments).toEqual(['Engineering', 'Sales']);
    });

    it('should calculate vendor efficiency ratings', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(vendorMocks);

      const result = await service.getVendorSummary();

      expect(
        result.data.find((vendor) => vendor.vendor === 'SoloVendor')
          ?.efficiency_rating,
      ).toBe('excellent');
      expect(
        result.data.find((vendor) => vendor.vendor === 'PremiumCo')
          ?.efficiency_rating,
      ).toBe('poor');
    });

    it('should identify most expensive and most efficient vendors', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(vendorMocks);

      const result = await service.getVendorSummary();

      expect(result.most_expensive_vendor).toBe('PremiumCo');
      expect(result.most_efficient_vendor).toBe('SoloVendor');
    });

    it('should count single tool vendors', async () => {
      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue(vendorMocks);

      const result = await service.getVendorSummary();

      expect(result.single_tool_vendors_count).toBe(2);
    });
  });
});

const countDecimals = (value: number) => {
  const [, decimals = ''] = value.toString().split('.'); // Handle cases like 100 -> no decimals, 100.0 -> 1 decimal, 100.00 -> 2 decimals
  return decimals.length;
};
