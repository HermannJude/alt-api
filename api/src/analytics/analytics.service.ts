import { Injectable } from '@nestjs/common';
import { ToolStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DepartmentCostDto,
  DepartmentCostSummaryDto,
} from './dto/analytics.dto';
import { roundTo } from './utils/calc.utils';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDepartmentCosts(
    sortBy: 'department' | 'total_cost' = 'department',
    order: 'asc' | 'desc' = 'asc',
  ): Promise<DepartmentCostSummaryDto> {
    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.active },
    });

    if (tools.length === 0) {
      return {
        data: [],
        total_cost: 0,
        most_expensive_department: null,
      };
    }

    const groupedByDept = tools.reduce(
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
      {} as Record<
        string,
        {
          department: string;
          total_cost: number;
          tools_count: number;
          total_users: number;
        }
      >,
    );

    const totalCost = Object.values(groupedByDept).reduce(
      (sum, department) => sum + department.total_cost,
      0,
    );

    const data: DepartmentCostDto[] = Object.values(groupedByDept)
      .map((dept) => ({
        department: dept.department,
        total_monthly_cost: dept.total_cost,
        tools_count: dept.tools_count,
        total_users: dept.total_users,
        average_cost_per_tool: roundTo(dept.total_cost / dept.tools_count, 2),
        cost_percentage: roundTo((dept.total_cost / totalCost) * 100, 1),
      }))
      .sort((a, b) => {
        const aVal =
          sortBy === 'department' ? a.department : a.total_monthly_cost;
        const bVal =
          sortBy === 'department' ? b.department : b.total_monthly_cost;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        const result = (aVal as number) - (bVal as number);
        return order === 'asc' ? result : -result;
      });

    const mostExpensive = data.reduce((max, curr) =>
      curr.total_monthly_cost > max.total_monthly_cost ? curr : max,
    );

    return {
      data,
      total_cost: totalCost,
      most_expensive_department:
        mostExpensive.total_monthly_cost > 0 ? mostExpensive.department : null,
    };
  }
}
