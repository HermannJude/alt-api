import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsageMetricsService } from './usage-metrics.service';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UpdateUsageMetricDto } from './dto/update-usage-metric.dto';

@Controller('usage-metrics')
export class UsageMetricsController {
  constructor(private readonly usageMetricsService: UsageMetricsService) {}

  @Post()
  create(@Body() createUsageMetricDto: CreateUsageMetricDto) {
    return this.usageMetricsService.create(createUsageMetricDto);
  }

  @Get()
  findAll() {
    return this.usageMetricsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usageMetricsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsageMetricDto: UpdateUsageMetricDto) {
    return this.usageMetricsService.update(+id, updateUsageMetricDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usageMetricsService.remove(+id);
  }
}
