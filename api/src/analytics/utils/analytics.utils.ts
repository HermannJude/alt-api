import type { ToolModel } from 'generated/prisma/models/Tool';
import type { DepartmentCostDto } from '../dto/analytics.dto';
import { EfficiencyRating } from '../types/analytics.types';

export const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const sumBy = <T>(items: T[], selector: (item: T) => number) =>
  items.reduce((sum, item) => sum + selector(item), 0);

export interface DepartmentGroup {
  department: string;
  total_cost: number;
  tools_count: number;
  total_users: number;
}

export const groupToolsByDepartment = (tools: ToolModel[]) =>
  tools.reduce(
    (acc, tool) => {
      if (!acc[tool.ownerDepartment]) {
        acc[tool.ownerDepartment] = {
          department: tool.ownerDepartment,
          total_cost: 0,
          tools_count: 0,
          total_users: 0,
        };
      }

      acc[tool.ownerDepartment].total_cost += Number(tool.monthlyCost);
      acc[tool.ownerDepartment].tools_count += 1;
      acc[tool.ownerDepartment].total_users += tool.activeUsersCount;
      return acc;
    },
    {} as Record<string, DepartmentGroup>,
  );

export const sortDepartmentCostItems = (
  items: DepartmentCostDto[],
  sortBy: 'department' | 'total_cost',
  order: 'asc' | 'desc',
) =>
  [...items].sort((a, b) => {
    const aVal = sortBy === 'department' ? a.department : a.total_monthly_cost;
    const bVal = sortBy === 'department' ? b.department : b.total_monthly_cost;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    const result = (aVal as number) - (bVal as number);
    return order === 'asc' ? result : -result;
  });

export const getMostExpensiveBy = <T>(
  items: T[],
  selector: (item: T) => number,
) => items.reduce((max, item) => (selector(item) > selector(max) ? item : max));

export const calculateCostPerUser = (
  monthlyCost: number,
  activeUsersCount: number,
) => {
  if (activeUsersCount <= 0) {
    return Infinity;
  }

  return roundTo(monthlyCost / activeUsersCount, 2);
};

export const getEfficiencyRating = (
  costPerUser: number,
  companyAverage: number,
): EfficiencyRating => {
  if (!Number.isFinite(costPerUser)) {
    return EfficiencyRating.LOW;
  }

  if (companyAverage <= 0) {
    return EfficiencyRating.AVERAGE;
  }

  const ratio = costPerUser / companyAverage;

  if (ratio < 0.5) return EfficiencyRating.EXCELLENT;
  if (ratio < 0.8) return EfficiencyRating.GOOD;
  if (ratio <= 1.2) return EfficiencyRating.AVERAGE;
  return EfficiencyRating.LOW;
};

export const getLowUsageWarningLevel = (
  costPerUser: number | null,
): 'high' | 'medium' | 'low' => {
  if (
    costPerUser === null ||
    !Number.isFinite(costPerUser) ||
    costPerUser > 50
  ) {
    return 'high';
  }

  if (costPerUser >= 20) {
    return 'medium';
  }

  return 'low';
};

export const getLowUsagePotentialAction = (
  warningLevel: 'high' | 'medium' | 'low',
) => {
  if (warningLevel === 'high') {
    return 'Consider canceling or downgrading';
  }

  if (warningLevel === 'medium') {
    return 'Review usage and consider optimization';
  }

  return 'Monitor usage trends';
};

export const getVendorEfficiencyRating = (
  costPerUser: number | null,
): EfficiencyRating => {
  if (costPerUser === null || !Number.isFinite(costPerUser)) {
    return EfficiencyRating.POOR;
  }

  if (costPerUser < 5) return EfficiencyRating.EXCELLENT;
  if (costPerUser < 15) return EfficiencyRating.GOOD;
  if (costPerUser < 25) return EfficiencyRating.AVERAGE;
  return EfficiencyRating.POOR;
};
