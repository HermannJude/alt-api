import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EfficiencyRating } from '../types/analytics.types';

class DepartmentCostDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  department!: string;

  @ApiProperty({ example: 12500.5 })
  @IsNumber()
  total_monthly_cost!: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  tools_count!: number;

  @ApiProperty({ example: 340 })
  @IsInt()
  total_users!: number;

  @ApiProperty({ example: 1041.71 })
  @IsNumber()
  average_cost_per_tool!: number;

  @ApiProperty({ example: 32.5 })
  @IsNumber()
  cost_percentage!: number;
}

class DepartmentCostSummaryDto {
  @ApiProperty({ type: [DepartmentCostDto] })
  @IsArray()
  data!: DepartmentCostDto[];

  @ApiProperty({ example: 38500.75 })
  @IsNumber()
  total_cost!: number;

  @ApiProperty({ example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  most_expensive_department?: string | null;
}

class ExpensiveToolDto {
  @ApiProperty({ example: 42 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Productivity Pro' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  vendor!: string;

  @ApiProperty({ example: 499.99 })
  @IsNumber()
  monthly_cost!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  active_users!: number;

  @ApiProperty({ example: 49.99, required: false })
  @IsOptional()
  @IsNumber()
  cost_per_user?: number | null;

  @ApiProperty({ example: EfficiencyRating.AVERAGE })
  @IsEnum(EfficiencyRating)
  efficiency_rating!: EfficiencyRating;
}

class ExpensiveToolAnalysisDto {
  @ApiProperty({ type: [ExpensiveToolDto] })
  @IsArray()
  data!: ExpensiveToolDto[];

  @ApiProperty({ example: 10 })
  @IsInt()
  total_tools_analyzed!: number;

  @ApiProperty({ example: 1200.5 })
  @IsNumber()
  potential_savings_identified!: number;
}

class ToolsByCategoryDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  category_id!: number;

  @ApiProperty({ example: 'Design' })
  @IsString()
  category_name!: string;

  @ApiProperty({ example: 3200.0 })
  @IsNumber()
  total_cost!: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  tools_count!: number;

  @ApiProperty({ example: 25 })
  @IsInt()
  total_users!: number;

  @ApiProperty({ example: 8.3 })
  @IsNumber()
  percentage_of_budget!: number;

  @ApiProperty({ example: 12.8, required: false })
  @IsOptional()
  @IsNumber()
  average_cost_per_user?: number | null;
}

class ToolsByCategoryInsightsDto {
  @ApiProperty({ type: [ToolsByCategoryDto] })
  @IsArray()
  data!: ToolsByCategoryDto[];

  @ApiProperty({ example: 'Design', required: false })
  @IsOptional()
  @IsString()
  most_expensive_category?: string | null;

  @ApiProperty({ example: 'Productivity', required: false })
  @IsOptional()
  @IsString()
  most_efficient_category?: string | null;
}

class LowUsageToolDto {
  @ApiProperty({ example: 7 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'ChatOps' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'ChatCo' })
  @IsString()
  vendor!: string;

  @ApiProperty({ example: 200.0 })
  @IsNumber()
  monthly_cost!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  active_users!: number;

  @ApiProperty({ example: 100.0, required: false })
  @IsOptional()
  @IsNumber()
  cost_per_user?: number | null;

  @ApiProperty({ example: 'high' })
  @IsString()
  warning_level!: string;

  @ApiProperty({ example: 'Consider canceling or downgrading' })
  @IsString()
  potential_action!: string;
}

class LowUsageSavingsAnalysisDto {
  @ApiProperty({ type: [LowUsageToolDto] })
  @IsArray()
  data!: LowUsageToolDto[];

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  monthly_savings!: number;

  @ApiProperty({ example: 18000.0 })
  @IsNumber()
  annual_savings!: number;
}

class VendorSummaryDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  vendor!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  tools_count!: number;

  @ApiProperty({ example: 2400.0 })
  @IsNumber()
  total_monthly_cost!: number;

  @ApiProperty({ example: 120 })
  @IsInt()
  total_users!: number;

  @ApiProperty({ example: ['Engineering', 'Product'] })
  @IsArray()
  departments!: string[];

  @ApiProperty({ example: 20.0, required: false })
  @IsOptional()
  @IsNumber()
  cost_per_user?: number | null;

  @ApiProperty({ example: EfficiencyRating.GOOD })
  @IsEnum(EfficiencyRating)
  efficiency_rating!: EfficiencyRating;
}

class VendorInsightsDto {
  @ApiProperty({ type: [VendorSummaryDto] })
  @IsArray()
  data!: VendorSummaryDto[];

  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsOptional()
  @IsString()
  most_expensive_vendor?: string | null;

  @ApiProperty({ example: 'MiniTools Ltd', required: false })
  @IsOptional()
  @IsString()
  most_efficient_vendor?: string | null;

  @ApiProperty({ example: 5 })
  @IsInt()
  single_tool_vendors_count!: number;
}

export {
  DepartmentCostDto,
  DepartmentCostSummaryDto,
  ExpensiveToolAnalysisDto,
  ExpensiveToolDto,
  LowUsageSavingsAnalysisDto,
  LowUsageToolDto,
  ToolsByCategoryDto,
  ToolsByCategoryInsightsDto,
  VendorInsightsDto,
  VendorSummaryDto,
};
