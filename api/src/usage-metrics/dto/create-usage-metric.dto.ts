import { IsInt, IsDate, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsageMetricDto {
  @IsInt({ message: 'toolId must be an integer' })
  @Min(1, { message: 'toolId must be a positive number' })
  toolId!: number;

  @Type(() => Date)
  @IsDate({ message: 'periodStart must be a valid date' })
  periodStart!: Date;

  @Type(() => Date)
  @IsDate({ message: 'periodEnd must be a valid date' })
  periodEnd!: Date;

  @IsInt({ message: 'totalSessions must be an integer' })
  @Min(0, { message: 'totalSessions must be non-negative' })
  totalSessions!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'avgSessionMinutes must be a number with max 2 decimals' },
  )
  @Min(0, { message: 'avgSessionMinutes must be non-negative' })
  avgSessionMinutes!: number;
}
