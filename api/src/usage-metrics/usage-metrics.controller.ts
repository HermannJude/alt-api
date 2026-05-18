import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsageMetricsService } from './usage-metrics.service';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';

@ApiTags('usage-metrics')
@Controller('usage-metrics')
export class UsageMetricsController {
  constructor(private readonly usageMetricsService: UsageMetricsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List usage metrics',
    description: 'Retrieve usage metrics with optional filtering by tool ID',
  })
  @ApiQuery({
    name: 'toolId',
    required: false,
    type: Number,
    description: 'Filter metrics by tool ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of usage metrics',
    schema: {
      example: {
        data: [
          {
            id: 1,
            toolId: 1,
            periodStart: '2025-08-01',
            periodEnd: '2025-08-31',
            totalSessions: 1250,
            avgSessionMinutes: 45,
          },
        ],
      },
    },
  })
  findAll(
    @Query('toolId', new ParseIntPipe({ optional: true })) toolId?: number,
  ) {
    return this.usageMetricsService.findAll(toolId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Record usage metrics for a tool',
    description:
      'Create a new usage metrics entry for tracking tool usage over a period',
  })
  @ApiResponse({
    status: 201,
    description: 'Usage metric created successfully',
    schema: {
      example: {
        id: 1,
        toolId: 1,
        periodStart: '2025-08-01',
        periodEnd: '2025-08-31',
        totalSessions: 1250,
        avgSessionMinutes: 45,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(@Body() createUsageMetricDto: CreateUsageMetricDto) {
    return this.usageMetricsService.create(createUsageMetricDto);
  }
}
