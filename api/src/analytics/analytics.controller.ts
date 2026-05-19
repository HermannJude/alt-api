import {
  Controller,
  Get,
  NotImplementedException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { DepartmentCostSummaryDto } from './dto/analytics.dto';

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
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
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
  getExpensiveTools() {
    throw new NotImplementedException('This endpoint is not implemented yet');
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
