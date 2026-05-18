import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Department, ToolStatus } from 'generated/prisma/enums';

export class QueryToolsDto {
  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  min_cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  max_cost?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn([
    'name_asc',
    'name_desc',
    'cost_asc',
    'cost_desc',
    'created_at_asc',
    'created_at_desc',
  ])
  sort?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;
}
