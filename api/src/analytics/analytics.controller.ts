import { Controller, Get, NotImplementedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('department-costs')
  getDepartmentCosts() {
    throw new NotImplementedException('This endpoint is not implemented yet');
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
