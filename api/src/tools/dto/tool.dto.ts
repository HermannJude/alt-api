import { UsageMetricsSummaryDto } from 'src/usage-metrics/dto/usage-metric.dto';

export class ToolResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  vendor!: string | null;
  website_url!: string | null;
  category!: string;
  monthly_cost!: number;
  owner_department!: string;
  status!: string;
  active_users_count!: number;
  created_at!: Date;
  updated_at!: Date;
  usage_metrics?: UsageMetricsSummaryDto;
}

export class ToolListResponseDto {
  data!: ToolResponseDto[];
  total!: number;
  filtered!: number;
  filters_applied?: Record<string, string | number | boolean | null>;
}
