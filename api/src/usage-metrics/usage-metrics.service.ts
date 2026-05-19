import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UpdateUsageMetricDto } from './dto/update-usage-metric.dto';

@Injectable()
export class UsageMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUsageMetricDto: CreateUsageMetricDto) {
    return this.prisma.usageMetric.create({
      data: {
        toolId: createUsageMetricDto.toolId,
        periodStart: new Date(createUsageMetricDto.periodStart),
        periodEnd: new Date(createUsageMetricDto.periodEnd),
        totalSessions: createUsageMetricDto.totalSessions,
        avgSessionMinutes: createUsageMetricDto.avgSessionMinutes,
      },
    });
  }

  findAll(toolId?: number) {
    if (toolId) {
      return this.prisma.usageMetric.findMany({
        where: { toolId },
        orderBy: { periodStart: 'desc' },
      });
    }
    return this.prisma.usageMetric.findMany({
      orderBy: { periodStart: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.usageMetric.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUsageMetricDto: UpdateUsageMetricDto) {
    return this.prisma.usageMetric.update({
      where: { id },
      data: updateUsageMetricDto as Prisma.UsageMetricUpdateInput,
    });
  }

  remove(id: number) {
    return this.prisma.usageMetric.delete({
      where: { id },
    });
  }
}
