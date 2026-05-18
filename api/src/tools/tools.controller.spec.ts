import { Test, TestingModule } from '@nestjs/testing';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';
import { NotFoundException } from '@nestjs/common';
import { QueryToolsDto } from './dto/query-tools.dto';
import { Department } from 'generated/prisma/enums';

describe('ToolsController', () => {
  let controller: ToolsController;
  let service: ToolsService;

  const mockToolResponse = {
    id: 1,
    name: 'Slack',
    description: 'Messaging',
    vendor: 'Slack Inc',
    website_url: 'https://slack.com',
    category: 'Communication',
    monthly_cost: 8.0,
    owner_department: 'Engineering',
    status: 'active',
    active_users_count: 10,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToolsController],
      providers: [
        {
          provide: ToolsService,
          useValue: {
            createTool: jest.fn(),
            getToolList: jest.fn(),
            findToolById: jest.fn(),
            updateTool: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ToolsController>(ToolsController);
    service = module.get<ToolsService>(ToolsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getToolList', () => {
    it('should return paginated list of tools', async () => {
      const query: QueryToolsDto = { page: 1, limit: 10 };
      const mockResponse = {
        data: [mockToolResponse],
        total: 20,
        filtered: 15,
        filters_applied: { page: 1, limit: 10 },
      };

      jest.spyOn(service, 'getToolList').mockResolvedValue(mockResponse);

      const result = await controller.getToolList(query);

      expect(service.getToolList).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(20);
    });

    it('should pass filters to service', async () => {
      const query: QueryToolsDto = {
        page: 1,
        limit: 10,
        department: 'Engineering',
        status: 'active',
      };

      jest.spyOn(service, 'getToolList').mockResolvedValue({
        data: [],
        total: 0,
        filtered: 0,
        filters_applied: {},
      });

      await controller.getToolList(query);

      expect(service.getToolList).toHaveBeenCalledWith(query);
    });
  });

  describe('getTool', () => {
    it('should return tool if found', async () => {
      jest.spyOn(service, 'findToolById').mockResolvedValue(mockToolResponse);

      const result = await controller.getTool(1);

      expect(service.findToolById).toHaveBeenCalledWith(1);
      expect(result.name).toBe('Slack');
    });

    it('should throw NotFoundException if tool not found', async () => {
      jest.spyOn(service, 'findToolById').mockResolvedValue(null);

      await expect(controller.getTool(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTool', () => {
    it('should create tool successfully', async () => {
      const createDto = {
        name: 'Linear',
        description: 'Issue tracking',
        vendor: 'Linear',
        websiteUrl: 'https://linear.app',
        categoryId: 2,
        monthlyCost: 8.0,
        ownerDepartment: Department.Engineering,
      };

      jest.spyOn(service, 'createTool').mockResolvedValue(mockToolResponse);

      const result = await controller.createTool(createDto);

      expect(service.createTool).toHaveBeenCalledWith(createDto);
      expect(result.name).toBe('Slack');
    });
  });

  describe('updateTool', () => {
    it('should update tool successfully', async () => {
      const updateDto = { monthlyCost: 10.0 };
      const updated = { ...mockToolResponse, monthly_cost: 10.0 };

      jest.spyOn(service, 'updateTool').mockResolvedValue(updated);

      const result = await controller.updateTool(1, updateDto);

      expect(service.updateTool).toHaveBeenCalledWith(1, updateDto);
      expect(result.monthly_cost).toBe(10.0);
    });
  });
});
