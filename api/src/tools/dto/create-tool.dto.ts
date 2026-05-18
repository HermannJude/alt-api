import { Type } from 'class-transformer';
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
  websiteUrl?: string;

  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyCost!: number;

  @IsEnum(Department)
  ownerDepartment!: Department;

  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;
}
