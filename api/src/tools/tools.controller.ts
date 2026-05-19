import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolResponseDto } from './dto/tool.dto';
import { QueryToolsDto } from './dto/query-tools.dto';

@ApiTags('tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List all tools with optional filters',
    description:
      'Retrieve a paginated list of tools with support for filtering by department, status, cost range, category, sorting and pagination. Returns metadata about total items and applied filters.',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description:
      'Filter by owner department (Engineering, Sales, Marketing, HR, Finance, Operations, Design)',
    example: 'Engineering',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by tool status (active, deprecated, trial)',
    example: 'active',
  })
  @ApiQuery({
    name: 'min_cost',
    required: false,
    type: Number,
    description: 'Minimum monthly cost filter',
    example: 5,
  })
  @ApiQuery({
    name: 'max_cost',
    required: false,
    type: Number,
    description: 'Maximum monthly cost filter',
    example: 100,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category name',
    example: 'Communication',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description:
      'Sort by field (cost_asc, cost_desc, name_asc, name_desc, created_at_asc, created_at_desc)',
    example: 'cost_asc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (1-indexed)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of tools with pagination metadata',
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'Slack',
            description: 'Team communication and messaging platform',
            vendor: 'Slack Technologies',
            website_url: 'https://slack.com',
            category: 'Communication',
            monthly_cost: 8.5,
            owner_department: 'Engineering',
            status: 'active',
            active_users_count: 25,
            created_at: '2025-05-01T09:00:00Z',
            updated_at: '2025-05-01T09:00:00Z',
          },
        ],
        total: 20,
        filtered: 15,
        filters_applied: {
          department: 'Engineering',
          status: 'active',
        },
      },
    },
  })
  getToolList(@Query() query: QueryToolsDto) {
    return this.toolsService.getToolList(query);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get a specific tool by ID',
    description:
      'Retrieve detailed information about a specific tool including usage metrics',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the tool',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tool details with all fields',
    schema: {
      example: {
        id: 1,
        name: 'Slack',
        description: 'Team communication and messaging platform',
        vendor: 'Slack Technologies',
        website_url: 'https://slack.com',
        category: 'Communication',
        monthly_cost: 8.5,
        owner_department: 'Engineering',
        status: 'active',
        active_users_count: 25,
        created_at: '2025-05-01T09:00:00Z',
        updated_at: '2025-05-01T09:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tool not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Tool with ID 999 does not exist',
        error: 'Not Found',
        timestamp: '2025-08-20T10:30:00.000Z',
      },
    },
  })
  async getTool(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ToolResponseDto> {
    const tool = await this.toolsService.findToolById(id);

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} does not exist`);
    }

    return tool;
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new tool',
    description:
      'Add a new tool to the catalog. All required fields must be provided. Accepts both camelCase and snake_case input formats.',
  })
  @ApiBody({
    type: CreateToolDto,
    description: 'Tool creation payload',
    examples: {
      example1: {
        summary: 'Create a new communication tool',
        value: {
          name: 'Slack',
          description: 'Team communication and messaging platform',
          vendor: 'Slack Technologies',
          websiteUrl: 'https://slack.com',
          categoryId: 1,
          monthlyCost: 8.5,
          ownerDepartment: 'Engineering',
          status: 'active',
        },
      },
      example2: {
        summary: 'Create with snake_case format',
        value: {
          name: 'Linear',
          vendor: 'Linear',
          website_url: 'https://linear.app',
          category_id: 2,
          monthly_cost: 8.0,
          owner_department: 'Engineering',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tool created successfully',
    schema: {
      example: {
        id: 21,
        name: 'Slack',
        description: 'Team communication and messaging platform',
        vendor: 'Slack Technologies',
        website_url: 'https://slack.com',
        category: 'Communication',
        monthly_cost: 8.5,
        owner_department: 'Engineering',
        status: 'active',
        active_users_count: 0,
        created_at: '2025-08-20T14:30:00Z',
        updated_at: '2025-08-20T14:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name must be between 2 and 100 characters',
          'monthlyC ost must be a positive number',
        ],
        error: 'Bad Request',
        timestamp: '2025-08-20T14:30:00.000Z',
      },
    },
  })
  async createTool(
    @Body() createToolDto: CreateToolDto,
  ): Promise<ToolResponseDto> {
    return await this.toolsService.createTool(createToolDto);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update an existing tool',
    description:
      'Partially update a tool. Only provided fields will be updated. Automatically updates the modified timestamp.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the tool to update',
    example: 1,
  })
  @ApiBody({
    type: UpdateToolDto,
    description: 'Partial tool update payload (all fields optional)',
    examples: {
      example1: {
        summary: 'Update price and status',
        value: {
          monthlyCost: 12.99,
          status: 'deprecated',
        },
      },
      example2: {
        summary: 'Update description only',
        value: {
          description: 'Updated after contract renewal',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tool updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Slack',
        description: 'Updated after contract renewal',
        vendor: 'Slack Technologies',
        website_url: 'https://slack.com',
        category: 'Communication',
        monthly_cost: 12.99,
        owner_department: 'Engineering',
        status: 'deprecated',
        active_users_count: 25,
        created_at: '2025-05-01T09:00:00Z',
        updated_at: '2025-08-20T15:45:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tool not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async updateTool(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateToolDto: UpdateToolDto,
  ): Promise<ToolResponseDto> {
    return await this.toolsService.updateTool(id, updateToolDto);
  }
}
