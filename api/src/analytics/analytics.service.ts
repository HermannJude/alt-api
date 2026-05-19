import { BadRequestException, Injectable } from '@nestjs/common';
import { ToolStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import {
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
} from './dto/analytics.dto';
import { EfficiencyRating } from './types/analytics.types';
import {
  calculateCostPerUser,
  getEfficiencyRating,
  getLowUsagePotentialAction,
  getLowUsageWarningLevel,
  getMostExpensiveBy,
  getVendorEfficiencyRating,
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

    const mostExpensive = getMostExpensiveBy(data, (cat) => cat.total_cost);

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

  async getLowUsageTools(maxUsers = 5): Promise<LowUsageSavingsAnalysisDto> {
    if (!Number.isInteger(maxUsers) || maxUsers < 1) {
      throw new BadRequestException('max_users must be a positive integer');
    }

    const tools = await this.prisma.tool.findMany({
      where: {
        status: ToolStatus.active,
        activeUsersCount: {
          lte: maxUsers,
        },
      },
    });

    const data: LowUsageToolDto[] = tools
      .map((tool) => {
        const monthlyCost = Number(tool.monthlyCost);
        const costPerUser =
          tool.activeUsersCount > 0
            ? roundTo(monthlyCost / tool.activeUsersCount, 2)
            : null;
        const warningLevel = getLowUsageWarningLevel(costPerUser);

        return {
          id: tool.id,
          name: tool.name,
          vendor: tool.vendor ?? '',
          monthly_cost: monthlyCost,
          active_users: tool.activeUsersCount,
          cost_per_user: costPerUser,
          warning_level: warningLevel,
          potential_action: getLowUsagePotentialAction(warningLevel),
        };
      })
      .sort((a, b) => {
        const aCost = a.cost_per_user ?? Number.POSITIVE_INFINITY;
        const bCost = b.cost_per_user ?? Number.POSITIVE_INFINITY;

        if (aCost !== bCost) {
          return bCost - aCost;
        }

        return b.monthly_cost - a.monthly_cost;
      });

    const monthlySavings = roundTo(
      sumBy(
        data.filter(
          (tool) =>
            tool.warning_level === 'high' || tool.warning_level === 'medium',
        ),
        (tool) => tool.monthly_cost,
      ),
      2,
    );

    return {
      data,
      monthly_savings: monthlySavings,
      annual_savings: roundTo(monthlySavings * 12, 2),
    };
  }

  async getVendorSummary(): Promise<VendorInsightsDto> {
    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.active },
    });

    if (tools.length === 0) {
      return {
        data: [],
        most_expensive_vendor: null,
        most_efficient_vendor: null,
        single_tool_vendors_count: 0,
      };
    }

    const groupedByVendor = tools.reduce(
      (acc, tool) => {
        const vendor = tool.vendor?.trim() || 'Unknown';

        if (!acc[vendor]) {
          acc[vendor] = {
            vendor,
            tools_count: 0,
            total_monthly_cost: 0,
            total_users: 0,
            departments: new Set<string>(),
          };
        }

        acc[vendor].tools_count += 1;
        acc[vendor].total_monthly_cost += Number(tool.monthlyCost);
        acc[vendor].total_users += tool.activeUsersCount;
        acc[vendor].departments.add(tool.ownerDepartment);
        return acc;
      },
      {} as Record<
        string,
        {
          vendor: string;
          tools_count: number;
          total_monthly_cost: number;
          total_users: number;
          departments: Set<string>;
        }
      >,
    );

    const data: VendorSummaryDto[] = Object.values(groupedByVendor)
      .map((vendor) => {
        const costPerUser =
          vendor.total_users > 0
            ? roundTo(vendor.total_monthly_cost / vendor.total_users, 2)
            : null;

        return {
          vendor: vendor.vendor,
          tools_count: vendor.tools_count,
          total_monthly_cost: roundTo(vendor.total_monthly_cost, 2),
          total_users: vendor.total_users,
          departments: Array.from(vendor.departments).sort(),
          cost_per_user: costPerUser,
          efficiency_rating: getVendorEfficiencyRating(costPerUser),
        };
      })
      .sort((a, b) => a.vendor.localeCompare(b.vendor));

    const mostExpensiveVendor = getMostExpensiveBy(
      data,
      (vendor) => vendor.total_monthly_cost,
    );

    const mostEfficientVendor = data
      .filter((vendor) => vendor.cost_per_user !== null)
      .reduce<VendorSummaryDto | null>((min, vendor) => {
        if (!min) {
          return vendor;
        }

        return (vendor.cost_per_user ?? Number.POSITIVE_INFINITY) <
          (min.cost_per_user ?? Number.POSITIVE_INFINITY)
          ? vendor
          : min;
      }, null);

    return {
      data,
      most_expensive_vendor:
        mostExpensiveVendor.total_monthly_cost > 0
          ? mostExpensiveVendor.vendor
          : null,
      most_efficient_vendor: mostEfficientVendor?.vendor ?? null,
      single_tool_vendors_count: data.filter(
        (vendor) => vendor.tools_count === 1,
      ).length,
    };
  }
}
