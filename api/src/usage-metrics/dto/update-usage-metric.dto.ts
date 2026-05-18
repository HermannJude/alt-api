import { PartialType } from '@nestjs/mapped-types';
import { CreateUsageMetricDto } from './create-usage-metric.dto';

export class UpdateUsageMetricDto extends PartialType(CreateUsageMetricDto) {}
