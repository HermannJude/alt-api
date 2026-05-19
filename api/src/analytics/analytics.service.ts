import { BadRequestException, Injectable } from '@nestjs/common';
import { ToolStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DepartmentCostDto,
  DepartmentCostSummaryDto,
  ExpensiveToolAnalysisDto,
  ExpensiveToolDto,
  ToolsByCategoryDto,
  ToolsByCategoryInsightsDto,
} from './dto/analytics.dto';
import { EfficiencyRating } from './types/analytics.types';
import {
  calculateCostPerUser,
  getEfficiencyRating,
  getMostExpensiveBy,
  groupToolsByDepartment,
  roundTo,
  sortDepartmentCostItems,
  sumBy,
} from './utils/analytics.utils';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExpensiveTools(
    limit = 10,
    minCost?: number,
  ): Promise<ExpensiveToolAnalysisDto> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException(
        'limit must be a positive integer between 1 and 100',
      );
    }

    if (minCost !== undefined && (!Number.isFinite(minCost) || minCost < 0)) {
      throw new BadRequestException('min_cost must be a positive number');
    }

    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.active },
    });

    const companyTools = tools.filter((tool) => tool.activeUsersCount > 0);
    const totalCompanyCost = sumBy(companyTools, (tool) =>
      Number(tool.monthlyCost),
    );
    const totalCompanyUsers = sumBy(
      companyTools,
      (tool) => tool.activeUsersCount,
    );
    const avgCostPerUserCompany =
      totalCompanyUsers > 0
        ? roundTo(totalCompanyCost / totalCompanyUsers, 2)
        : 0;

    const analyzedTools = tools
      .filter(
        (tool) => minCost === undefined || Number(tool.monthlyCost) >= minCost,
      )
      .sort((a, b) => Number(b.monthlyCost) - Number(a.monthlyCost))
      .slice(0, limit);

    const data: ExpensiveToolDto[] = analyzedTools.map((tool) => {
      const monthlyCost = Number(tool.monthlyCost);
      const costPerUser = calculateCostPerUser(
        monthlyCost,
        tool.activeUsersCount,
      );

      return {
        id: tool.id,
        name: tool.name,
        vendor: tool.vendor ?? '',
        monthly_cost: monthlyCost,
        active_users: tool.activeUsersCount,
        cost_per_user: costPerUser,
        efficiency_rating: getEfficiencyRating(
          costPerUser,
          avgCostPerUserCompany,
        ),
      };
    });

    const potentialSavingsIdentified = roundTo(
      sumBy(
        data.filter((tool) => tool.efficiency_rating === EfficiencyRating.LOW),
        (tool) => tool.monthly_cost,
      ),
      2,
    );

    return {
      data,
      total_tools_analyzed: data.length,
      potential_savings_identified: potentialSavingsIdentified,
    };
  }

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

    const groupedByDept = groupToolsByDepartment(tools);

    const totalCost = sumBy(
      Object.values(groupedByDept),
      (department) => department.total_cost,
    );

    const data: DepartmentCostDto[] = sortDepartmentCostItems(
      Object.values(groupedByDept).map((dept) => ({
        department: dept.department,
        total_monthly_cost: dept.total_cost,
        tools_count: dept.tools_count,
        total_users: dept.total_users,
        average_cost_per_tool: roundTo(dept.total_cost / dept.tools_count, 2),
        cost_percentage: roundTo((dept.total_cost / totalCost) * 100, 1),
      })),
      sortBy,
      order,
    );

    const mostExpensive = getMostExpensiveBy(
      data,
      (department) => department.total_monthly_cost,
    );

    return {
      data,
      total_cost: totalCost,
      most_expensive_department:
        mostExpensive.total_monthly_cost > 0 ? mostExpensive.department : null,
    };
  }

  async getToolsByCategory(): Promise<ToolsByCategoryInsightsDto> {
    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.active },
      include: { category: true },
    });

    if (tools.length === 0) {
      return {
        data: [],
        most_expensive_category: null,
        most_efficient_category: null,
      };
    }

    // Group by category
    const groupedByCategory = tools.reduce(
      (acc, tool) => {
        const catId = tool.categoryId;
        if (!acc[catId]) {
          acc[catId] = {
            category_id: catId,
            category_name: tool.category.name,
            total_cost: 0,
            tools_count: 0,
            total_users: 0,
          };
        }
        acc[catId].total_cost += Number(tool.monthlyCost);
        acc[catId].tools_count += 1;
        acc[catId].total_users += tool.activeUsersCount;
        return acc;
      },
      {} as Record<
        number,
        {
          category_id: number;
          category_name: string;
          total_cost: number;
          tools_count: number;
          total_users: number;
        }
      >,
    );

    const totalBudget = sumBy(
      Object.values(groupedByCategory),
      (cat) => cat.total_cost,
    );

    const data: ToolsByCategoryDto[] = Object.values(groupedByCategory)
      .map((cat) => ({
        category_id: cat.category_id,
        category_name: cat.category_name,
        total_cost: cat.total_cost,
        tools_count: cat.tools_count,
        total_users: cat.total_users,
        percentage_of_budget: roundTo((cat.total_cost / totalBudget) * 100, 1),
        average_cost_per_user:
          cat.total_users > 0
            ? roundTo(cat.total_cost / cat.total_users, 2)
            : null,
      }))
      .sort((a, b) => a.category_id - b.category_id);

    // Most expensive = highest total_cost
    const mostExpensive = getMostExpensiveBy(data, (cat) => cat.total_cost);

    // Most efficient = lowest cost_per_user (excluding null)
    const withValidCostPerUser = data.filter(
      (cat) => cat.average_cost_per_user !== null,
    );
    const mostEfficient =
      withValidCostPerUser.length > 0
        ? withValidCostPerUser.reduce((min, cat) =>
            (cat.average_cost_per_user ?? Infinity) <
            (min.average_cost_per_user ?? Infinity)
              ? cat
              : min,
          )
        : null;

    return {
      data,
      most_expensive_category: mostExpensive
        ? mostExpensive.category_name
        : null,
      most_efficient_category: mostEfficient
        ? mostEfficient.category_name
        : null,
    };
  }
}
