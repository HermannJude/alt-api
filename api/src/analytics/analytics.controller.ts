import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  NotImplementedException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  DepartmentCostSummaryDto,
  ExpensiveToolAnalysisDto,
} from './dto/analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('department-costs')
  @ApiOperation({
    summary: 'Department costs breakdown',
    description:
      'Aggregated tool costs by department with cost percentages and averages. Only includes active tools.',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['department', 'total_cost'],
    description: 'Sort by department name or total cost',
    type: String,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Department costs summary',
    type: DepartmentCostSummaryDto,
    example: {
      data: [
        {
          department: 'Engineering',
          total_monthly_cost: 890.5,
          tools_count: 12,
          total_users: 45,
          average_cost_per_tool: 74.21,
          cost_percentage: 36.2,
        },
      ],
      total_cost: 2450.8,
      most_expensive_department: 'Engineering',
    },
  })
  getDepartmentCosts(
    @Query('sort_by') sortBy: 'department' | 'total_cost' = 'department',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ): Promise<DepartmentCostSummaryDto> {
    return this.analyticsService.getDepartmentCosts(sortBy, order);
  }

  @Get('expensive-tools')
  @ApiOperation({
    summary: 'Expensive tools analysis',
    description:
      'Lists active tools by monthly cost, computes cost per user, and flags inefficient tools against company average.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of tools to return, between 1 and 100. Default 10.',
  })
  @ApiQuery({
    name: 'min_cost',
    required: false,
    type: Number,
    description: 'Minimum monthly cost filter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expensive tools analysis',
    type: ExpensiveToolAnalysisDto,
    example: {
      data: [
        {
          id: 15,
          name: 'Enterprise CRM',
          vendor: 'BigCorp',
          monthly_cost: 199.99,
          active_users: 12,
          cost_per_user: 16.67,
          efficiency_rating: 'low',
        },
      ],
      total_tools_analyzed: 18,
      potential_savings_identified: 345.5,
    },
  })
  getExpensiveTools(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('min_cost', new DefaultValuePipe('')) minCost?: string,
  ): Promise<ExpensiveToolAnalysisDto> {
    if (minCost !== undefined && minCost !== '') {
      // Validate min_cost if provided
      const parsedMinCost = Number(minCost);
      if (!Number.isFinite(parsedMinCost) || parsedMinCost < 0) {
        throw new BadRequestException('min_cost must be a positive number');
      }

      return this.analyticsService.getExpensiveTools(limit, parsedMinCost);
    }

    return this.analyticsService.getExpensiveTools(limit);
  }

  @Get('tools-by-category')
  getToolsByCategory() {
    throw new NotImplementedException('This endpoint is not implemented yet');
  }

  @Get('low-usage-tools')
  getLowUsageTools() {
    throw new NotImplementedException('This endpoint is not implemented yet');
  }

  @Get('vendor-summary')
  getVendorSummary() {
    throw new NotImplementedException('This endpoint is not implemented yet');
  }
}
