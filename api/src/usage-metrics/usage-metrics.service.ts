import { Injectable } from '@nestjs/common';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { UpdateUsageMetricDto } from './dto/update-usage-metric.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsageMetricsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createUsageMetricDto: CreateUsageMetricDto) {
    return this.prisma.usageMetric.create({
      data: createUsageMetricDto as Prisma.UsageMetricCreateInput,
    });
  }

  findAll() {
    return this.prisma.usageMetric.findMany();
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
