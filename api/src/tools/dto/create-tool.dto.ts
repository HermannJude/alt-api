import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { Department, ToolStatus } from 'generated/prisma/enums';

export class CreateToolDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendor?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  @Transform(({ value }) => value)
  websiteUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Transform(({ obj }) => obj.category_id ?? obj.categoryId)
  categoryId!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ obj }) => obj.monthly_cost ?? obj.monthlyCost)
  monthlyCost!: number;

  @IsEnum(Department)
  @Transform(({ obj }) => obj.owner_department ?? obj.ownerDepartment)
  ownerDepartment!: Department;

  @IsOptional()
  @IsEnum(ToolStatus)
  @Transform(({ obj }) => obj.status ?? obj.status)
  status?: ToolStatus;
}
