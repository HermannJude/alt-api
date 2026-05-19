import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolsService } from './tools.service';

describe('ToolsService', () => {
  let service: ToolsService;
  let prisma: PrismaService;

  const mockTool = {
    id: 1,
    name: 'Slack',
    description: 'Messaging',
    vendor: 'Slack Inc',
    websiteUrl: 'https://slack.com',
    categoryId: 1,
    monthlyCost: 8.0,
    activeUsersCount: 10,
    ownerDepartment: 'Engineering',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCategory = {
    id: 1,
    name: 'Communication',
    slug: 'communication',
    description: null,
    colorHex: '#6366f1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolsService,
        {
          provide: PrismaService,
          useValue: {
            tool: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ToolsService>(ToolsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTool', () => {
    it('should create a tool successfully', async () => {
      const createToolDto: CreateToolDto = {
        name: 'Slack',
        description: 'Messaging',
        vendor: 'Slack Inc',
        websiteUrl: 'https://slack.com',
        categoryId: 1,
        monthlyCost: 8.0,
        ownerDepartment: 'Engineering',
        status: 'active',
      };

      jest.spyOn(prisma.tool, 'create').mockResolvedValue({
        ...mockTool,
        category: mockCategory,
      } as any);

      const result = await service.createTool(createToolDto);

      expect(prisma.tool.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Slack',
          categoryId: 1,
        }),
        include: { category: true },
      });
      expect(result).toBeDefined();
      expect(result.name).toBe('Slack');
    });
  });

  describe('getToolList', () => {
    it('should return list with default pagination', async () => {
      const query: QueryToolsDto = {
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(prisma.tool, 'findMany')
        .mockResolvedValue([{ ...mockTool, category: mockCategory }] as any);
      jest.spyOn(prisma.tool, 'count').mockResolvedValue(1);

      const result = await service.getToolList(query);

      expect(prisma.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.filtered).toBe(1);
    });

    it('should filter by department', async () => {
      const query: QueryToolsDto = {
        page: 1,
        limit: 10,
        department: 'Engineering',
      };

      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.tool, 'count').mockResolvedValue(1);

      await service.getToolList(query);

      expect(prisma.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerDepartment: 'Engineering',
          }),
        }),
      );
    });

    it('should sort by cost ascending', async () => {
      const query: QueryToolsDto = {
        page: 1,
        limit: 10,
        sort: 'cost_asc',
      };

      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.tool, 'count').mockResolvedValue(0);

      await service.getToolList(query);

      expect(prisma.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { monthlyCost: 'asc' },
        }),
      );
    });

    it('should filter by cost range', async () => {
      const query: QueryToolsDto = {
        page: 1,
        limit: 10,
        min_cost: 5,
        max_cost: 15,
      };

      jest.spyOn(prisma.tool, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.tool, 'count').mockResolvedValue(0);

      await service.getToolList(query);

      expect(prisma.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            monthlyCost: {
              gte: 5,
              lte: 15,
            },
          }),
        }),
      );
    });
  });

  describe('findToolById', () => {
    it('should return tool if found', async () => {
      jest.spyOn(prisma.tool, 'findUnique').mockResolvedValue({
        ...mockTool,
        category: mockCategory,
        usageMetrics: [],
      } as any);

      const result = await service.findToolById(1);

      expect(prisma.tool.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
      expect(result).toBeDefined();
      expect(result?.name).toBe('Slack');
    });

    it('should return null if tool not found', async () => {
      jest.spyOn(prisma.tool, 'findUnique').mockResolvedValue(null);

      const result = await service.findToolById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateTool', () => {
    it('should update tool successfully', async () => {
      const updateDto = { monthlyCost: 10.0 };

      jest.spyOn(prisma.tool, 'update').mockResolvedValue({
        ...mockTool,
        monthlyCost: 10.0,
        category: mockCategory,
      } as any);

      const result = await service.updateTool(1, updateDto);

      expect(prisma.tool.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.any(Object),
        include: { category: true },
      });
      expect(result.monthly_cost).toBe(10.0);
    });
  });
});
